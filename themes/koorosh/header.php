<?php
/**
 * Koorosh header.
 *
 * Elementor Pro Theme Builder owns this location when it renders one. The
 * markup below is deliberately a neutral, editable-safe fallback for installs
 * without an active/configured Elementor header.
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
<a class="skip-link screen-reader-text" href="#content"><?php esc_html_e( 'Skip to content', 'koorosh' ); ?></a>
<?php
if ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'header' ) ) :
	?>
	<header class="site-header">
		<div class="site-container">
			<a class="site-title" href="<?php echo esc_url( home_url( '/' ) ); ?>">
				<?php echo esc_html( get_bloginfo( 'name' ) ); ?>
			</a>
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => 'nav',
					'container_class' => 'site-navigation',
					'container_aria_label' => __( 'Primary navigation', 'koorosh' ),
					'fallback_cb'    => false,
				)
			);
			?>
		</div>
	</header>
	<?php
endif;
