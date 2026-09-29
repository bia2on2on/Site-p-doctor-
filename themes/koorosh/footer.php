<?php
/**
 * Koorosh footer.
 *
 * Elementor Pro Theme Builder owns this location when it renders one. The
 * markup below is deliberately a neutral fallback for installs without an
 * active/configured Elementor footer. Only truthful current links appear in
 * the WordPress "footer" menu (owned by WordPress menu APIs, reconstructed in
 * CI); no contact data, address, legal or social links are invented here.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'footer' ) ) :
	?>
	<footer class="site-footer">
		<div class="site-container site-footer__inner">
			<p class="site-copyright">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></a>
			</p>
			<?php
			if ( has_nav_menu( 'footer' ) ) {
				wp_nav_menu(
					array(
						'theme_location'       => 'footer',
						'container'            => 'nav',
						'container_class'      => 'footer-navigation',
						'container_aria_label' => is_rtl() ? 'ناوبری فوتر' : __( 'Footer navigation', 'koorosh' ),
						'fallback_cb'          => false,
						'depth'                => 1,
					)
				);
			}
			?>
		</div>
	</footer>
	<?php
endif;

wp_footer();
?>
</body>
</html>
