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
	}
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
 * Register Elementor Theme Builder core locations when the public Theme API exists.
 * Does nothing if Elementor Pro / Theme locations are unavailable.
 */
add_action(
	'elementor/theme/register_locations',
	function ( $elementor_theme_manager ) {
		if ( is_object( $elementor_theme_manager ) && method_exists( $elementor_theme_manager, 'register_all_core_location' ) ) {
			$elementor_theme_manager->register_all_core_location();
		}
	}
);
