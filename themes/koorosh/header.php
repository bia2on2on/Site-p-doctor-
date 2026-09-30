<?php
/**
 * Koorosh header.
 *
 * Elementor Pro Theme Builder owns this location when it renders one. The
 * markup below is deliberately a neutral, editable-safe fallback for installs
 * without an active/configured Elementor header.
 *
 * The fallback is a minimal sales-site shell: site identity, the WordPress
 * menu assigned to the "primary" location (structure owned by WordPress menu
 * APIs, reconstructed in CI), and the persistent demo/consultation CTA. Menu
 * content is intentionally NOT hardcoded here; only the CTA is shell
 * furniture and disappears together with this fallback.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#content"><?php echo is_rtl() ? esc_html( 'رفتن به محتوا' ) : esc_html__( 'Skip to content', 'koorosh' ); ?></a>
<?php
if ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'header' ) ) :
	?>
	<header class="site-header">
		<?php $koorosh_show_title = (bool) koorosh_get_setting( 'header_show_site_title' ); ?>
		<div class="site-container site-header__inner<?php echo $koorosh_show_title ? '' : ' site-header__inner--no-title'; ?>">
			<?php
			// Custom Logo: WordPress core mechanism (Customizer → Site Identity); renders nothing when unset.
			if ( has_custom_logo() ) {
				the_custom_logo();
			}
			// Fallback-shell switches live in تنظیمات کوروش (defaults preserve the current shell).
			if ( $koorosh_show_title ) :
				?>
			<a class="site-title" href="<?php echo esc_url( home_url( '/' ) ); ?>">
				<?php echo esc_html( get_bloginfo( 'name' ) ); ?>
			</a>
			<?php endif; ?>
			<?php if ( has_nav_menu( 'primary' ) ) : ?>
				<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-primary-navigation">
					<span class="nav-toggle__bars" aria-hidden="true"><span></span><span></span><span></span></span>
					<span class="nav-toggle__label"><?php echo is_rtl() ? esc_html( 'منو' ) : esc_html__( 'Menu', 'koorosh' ); ?></span>
				</button>
				<?php
				wp_nav_menu(
					array(
						'theme_location'       => 'primary',
						'container'            => 'nav',
						'container_class'      => 'site-navigation',
						'container_id'         => 'site-primary-navigation',
						'container_aria_label' => is_rtl() ? 'ناوبری اصلی' : __( 'Primary navigation', 'koorosh' ),
						'fallback_cb'          => false,
					)
				);
				?>
			<?php endif; ?>
			<?php
			if ( koorosh_get_setting( 'header_show_cta' ) ) :
				$koorosh_cta_label = (string) koorosh_get_setting( 'header_cta_label' );
				if ( '' === $koorosh_cta_label ) {
					$koorosh_cta_label = is_rtl() ? 'درخواست دمو / مشاوره' : __( 'Request demo / consultation', 'koorosh' );
				}
				?>
			<a class="header-cta" href="<?php echo esc_url( home_url( '/demo/' ) ); ?>"><?php echo esc_html( $koorosh_cta_label ); ?></a>
			<?php endif; ?>
		</div>
	</header>
	<?php
endif;
