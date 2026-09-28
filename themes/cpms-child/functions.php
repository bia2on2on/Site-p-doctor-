<?php
/** Git-owned foundation over the unmodified Hello Elementor parent. */

add_action( 'wp_enqueue_scripts', function () {
	// Hello enqueues its own base/theme CSS; depend on it rather than loading it twice.
	wp_enqueue_style( 'cpms-child', get_stylesheet_uri(), array( 'hello-elementor-theme-style' ), wp_get_theme()->get( 'Version' ) );
	wp_enqueue_style( 'cpms-foundation', get_stylesheet_directory_uri() . '/foundation.css', array( 'cpms-child' ), wp_get_theme()->get( 'Version' ) );
}, 20 );

add_filter( 'elementor/fonts/groups', function ( $groups ) {
	$groups['cpms-local'] = 'Local';
	return $groups;
} );

add_filter( 'elementor/fonts/additional_fonts', function ( $fonts ) {
	$fonts['Vazirmatn'] = 'cpms-local';
	return $fonts;
} );
