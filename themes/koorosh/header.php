<?php
/**
 * Document opening and minimal fallback header.
 * Elementor Pro may render the Theme Builder header location instead.
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
<a class="koorosh-skip-link" href="#main-content"><?php esc_html_e( 'Skip to content', 'koorosh' ); ?></a>
<?php
if ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'header' ) ) :
	$site_name = get_bloginfo( 'name' );
	$menu      = wp_nav_menu(
		array(
			'theme_location' => 'primary',
			'fallback_cb'    => false,
			'echo'           => false,
		)
	);
	?>
	<header class="koorosh-fallback-header">
		<div class="koorosh-fallback-header__inner">
			<?php if ( $site_name ) : ?>
				<a class="koorosh-fallback-header__identity" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo esc_html( $site_name ); ?></a>
			<?php endif; ?>
			<?php if ( $menu ) : ?>
				<nav aria-label="<?php esc_attr_e( 'Primary', 'koorosh' ); ?>">
					<?php echo $menu; // WordPress returns sanitized menu markup. ?>
				</nav>
			<?php endif; ?>
		</div>
	</header>
<?php endif; ?>
