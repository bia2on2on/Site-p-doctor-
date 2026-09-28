<?php
/** Minimal fallback footer; Elementor Pro may render its Theme Builder location. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'footer' ) ) :
	$site_name = get_bloginfo( 'name' );
	$menu      = wp_nav_menu(
		array(
			'theme_location' => 'footer',
			'fallback_cb'    => false,
			'echo'           => false,
		)
	);
	?>
	<footer class="koorosh-fallback-footer">
		<?php if ( $site_name ) : ?>
			<p>
				&copy; <?php echo esc_html( wp_date( 'Y' ) ); ?>
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo esc_html( $site_name ); ?></a>
			</p>
		<?php endif; ?>
		<?php if ( $menu ) : ?>
			<nav aria-label="<?php esc_attr_e( 'Footer', 'koorosh' ); ?>">
				<?php echo $menu; // WordPress returns sanitized menu markup. ?>
			</nav>
		<?php endif; ?>
	</footer>
<?php endif; ?>
<?php wp_footer(); ?>
</body>
</html>
