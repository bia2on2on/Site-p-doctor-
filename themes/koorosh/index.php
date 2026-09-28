<?php
/**
 * Minimal semantic fallback. Page composition remains in WordPress content and Elementor.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<main id="main-content" tabindex="-1">
	<?php if ( have_posts() ) : ?>
		<?php while ( have_posts() ) : ?>
			<?php
			the_post();
			?>
			<article id="post-<?php echo esc_attr( (string) get_the_ID() ); ?>" <?php post_class(); ?>>
				<?php the_title( '<h1>', '</h1>' ); ?>
				<?php the_content(); ?>
			</article>
		<?php endwhile; ?>
	<?php endif; ?>
</main>
<?php
get_footer();
