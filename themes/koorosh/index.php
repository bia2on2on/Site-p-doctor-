<?php
/**
 * Minimal semantic fallback. Marketing layout belongs in Elementor.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

if ( function_exists( 'elementor_theme_do_location' ) && elementor_theme_do_location( 'single' ) ) {
	get_footer();
	return;
}

echo '<main id="content">';
if ( have_posts() ) {
	while ( have_posts() ) {
		the_post();
		echo '<article id="post-' . esc_attr( (string) get_the_ID() ) . '">';
		the_title( '<h1>', '</h1>' );
		the_content();
		echo '</article>';
	}
}
echo '</main>';

get_footer();
