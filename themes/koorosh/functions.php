<?php
/**
 * Koorosh (کوروش) — standalone lightweight theme.
 * Elementor / Elementor Pro own marketing composition.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'after_setup_theme',
	function () {
		load_theme_textdomain( 'koorosh' );
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support(
			'html5',
			array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' )
		);
		add_theme_support( 'align-wide' );
		add_theme_support( 'responsive-embeds' );
		register_nav_menus(
			array(
				'primary' => __( 'Primary Menu', 'koorosh' ),
				'footer'  => __( 'Footer Menu', 'koorosh' ),
			)
		);
	}
);

add_action(
	'wp_enqueue_scripts',
	function () {
		$version = wp_get_theme()->get( 'Version' );
		wp_enqueue_style( 'koorosh', get_stylesheet_uri(), array(), $version );
		wp_enqueue_style(
			'koorosh-foundation',
			get_stylesheet_directory_uri() . '/foundation.css',
			array( 'koorosh' ),
			$version
		);
		wp_enqueue_script(
			'koorosh-demo-form',
			get_stylesheet_directory_uri() . '/demo-form.js',
			array(),
			$version,
			true
		);
		// Tiny vanilla navigation enhancement; in <head> so the "koorosh-js"
		// class lands before paint and the collapsed mobile menu never flashes.
		wp_enqueue_script(
			'koorosh-nav',
			get_stylesheet_directory_uri() . '/nav.js',
			array(),
			$version,
			false
		);
	}
);

// Expose the current-page state WordPress already computes for menu items.
add_filter(
	'nav_menu_link_attributes',
	function ( $atts, $menu_item ) {
		if ( ! empty( $menu_item->current ) && empty( $atts['aria-current'] ) ) {
			$atts['aria-current'] = 'page';
		}
		return $atts;
	},
	10,
	2
);

add_filter(
	'elementor/fonts/groups',
	function ( $groups ) {
		$groups['koorosh-local'] = 'Local';
		return $groups;
	}
);

add_filter(
	'elementor/fonts/additional_fonts',
	function ( $fonts ) {
		$fonts['Vazirmatn'] = 'koorosh-local';
		return $fonts;
	}
);

/**
 * Register only the shell locations Koorosh renders. This is a documented
 * Elementor public hook; the guard keeps the theme independent of Elementor.
 */
add_action(
	'elementor/theme/register_locations',
	function ( $elementor_theme_manager ) {
		if ( ! is_object( $elementor_theme_manager ) || ! method_exists( $elementor_theme_manager, 'register_location' ) ) {
			return;
		}

		$elementor_theme_manager->register_location( 'header' );
		$elementor_theme_manager->register_location( 'footer' );
	}
);

// Self-hosted type is a site-wide performance/privacy requirement, not page styling.
add_filter( 'elementor/frontend/print_google_fonts', '__return_false' );

// Page excerpts are the editable description source until an SEO layer is authorized.
add_action(
	'init',
	function () {
		add_post_type_support( 'page', 'excerpt' );
	}
);
add_action(
	'wp_head',
	function () {
		if ( is_page_template( 'page-elementor.php' ) && has_excerpt() ) {
			printf( '<meta name="description" content="%s">' . "\n", esc_attr( wp_strip_all_tags( get_the_excerpt() ) ) );
		}
	}
);

/**
 * Environment-driven indexability layer (development/staging safety).
 *
 * SINGLE SWITCH: the WordPress core option `blog_public` ("Search engine
 * visibility"). Nothing in this theme hardcodes an indexing decision, so
 * activating indexability at launch stays an explicit environment/configuration
 * decision (flip `blog_public` to 1 on the production environment), not a code
 * change and not a default of this repository.
 *
 * Layers that are active while `blog_public` is 0 (development/CI today):
 *  1. WordPress core prints `<meta name="robots" content="noindex, nofollow">`
 *     (core `wp_robots_noindex()` on the `wp_robots` filter).
 *  2. WordPress core serves a `Disallow: /` robots.txt (core `do_robots()`).
 *  3. This filter adds the HTTP header `X-Robots-Tag: noindex, nofollow`, the
 *     second implementation form Google documents for the `noindex` rule —
 *     useful for non-HTML responses and for crawlers that fetch the URL
 *     without parsing the HTML head.
 *
 * HONEST LIMITS (Google Search Central, "Introduction to robots.txt" and
 * "Block Search indexing with noindex"): robots.txt is a crawl-management
 * mechanism, NOT an indexing control — a disallowed URL can still appear in
 * results without a description, and a crawler that obeys `Disallow` will not
 * even see the `noindex` meta tag or the `X-Robots-Tag` header. Therefore the
 * only robust protection for a non-public environment is the environment
 * itself (not publicly reachable / access-controlled). No such production
 * protection mechanism is claimed or configured by this repository.
 */
function koorosh_search_engine_visible() {
	return (bool) get_option( 'blog_public' );
}

add_filter(
	'wp_headers',
	function ( $headers ) {
		if ( ! koorosh_search_engine_visible() ) {
			$headers['X-Robots-Tag'] = 'noindex, nofollow';
		}

		return $headers;
	}
);

/**
 * Front-page document title.
 *
 * WordPress core's `wp_get_document_title()` uses the site name alone for the
 * front page, which would make the most important page in the site the only one
 * without its own authored title. This uses the core `document_title_parts`
 * filter (no plugin, no duplicated <title> tag — `title-tag` support still owns
 * output) to use the static front page's own editable page title when one
 * exists. Editors keep full control: the value is whatever the page title is.
 */
add_filter(
	'document_title_parts',
	function ( $parts ) {
		if ( ! is_front_page() || is_paged() ) {
			return $parts;
		}

		$front_id = (int) get_option( 'page_on_front' );
		if ( $front_id <= 0 ) {
			return $parts;
		}

		$front_title = get_the_title( $front_id );
		if ( ! is_string( $front_title ) || '' === trim( $front_title ) ) {
			return $parts;
		}

		$parts['title'] = $front_title;
		unset( $parts['tagline'] );

		return $parts;
	}
);

/*
 * Canonical URLs: intentionally left to WordPress core `rel_canonical()`
 * (registered on `wp_head` by core default filters). Core derives the canonical
 * from the site's own configured address, so no production domain is hardcoded
 * in this repository and a development URL can never be committed as a
 * production canonical. No second canonical tag is emitted by this theme and no
 * SEO plugin is installed for canonicals; exactly one canonical link per real
 * page is asserted by tests/browser/seo-foundation.mjs.
 *
 * Sitemap: intentionally left to the WordPress core sitemaps provider, which
 * core disables while `blog_public` is 0 — consistent with the intentional
 * non-indexing above. No SEO plugin is installed for a sitemap.
 */

// Theme Settings v1 (تنظیمات کوروش): one bounded option array, Settings API,
// `manage_options` only. Loaded before the Demo handler, which reads it.
require_once get_template_directory() . '/inc/theme-settings.php';

// Demo / consultation qualification form handler (safe non-live test mode).
require_once get_template_directory() . '/demo-form.php';

// Public contact details renderer for «تماس با ما» (/contact/): one narrowly
// scoped shortcode that reads the Koorosh contact settings at render time.
// Independent of the lead-recipient role in demo-form.php (see its header).
require_once get_template_directory() . '/contact-details.php';
