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

// Demo / consultation qualification form handler (safe non-live test mode).
require_once get_template_directory() . '/demo-form.php';
