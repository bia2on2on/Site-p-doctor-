<?php
/**
 * Template Name: Elementor content
 *
 * Semantic shell only: the editor owns the single H1 and all page composition.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
get_header();
?>
<main id="content" tabindex="-1">
	<?php
	while ( have_posts() ) {
		the_post();
		the_content();
	}
	?>
</main>
<?php get_footer(); ?>
