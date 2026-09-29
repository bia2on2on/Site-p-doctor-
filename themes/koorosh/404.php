<?php
/**
 * Koorosh utility 404 template.
 *
 * Deliberately a lightweight THEME utility page, not an Elementor-composed
 * marketing page: the current architecture composes marketing pages through the
 * editor from a reconstruction recipe, and a missing-route handler must keep
 * working even when no page/recipe exists. There is therefore no Elementor
 * editability requirement here (SITE-ARCHITECTURE §4.2 "404 — سیستمی").
 *
 * Contract:
 * - WordPress serves this template with a real HTTP 404 status (no redirect,
 *   no fallback-to-home), which is what Google's crawling documentation
 *   requires of a missing page; a 200 "page not found" would be a soft 404.
 * - Persian recovery copy + the normal site shell (header/nav/footer) so the
 *   visitor keeps every crawlable navigation path.
 * - Recovery links are resolved from REAL existing pages only (slug lookup);
 *   a link is printed only if that page actually exists, so this template can
 *   never link into another 404.
 * - No search UI (site search is not implemented — a fake search box would be
 *   a dead control), no marketing claim, no product capability statement.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

if ( ! function_exists( 'koorosh_existing_page_url' ) ) :
	/**
	 * Permalink for a real published page, or '' when that page does not exist.
	 * Guarded declaration: a template file can be included more than once.
	 *
	 * @param string $slug Page slug.
	 * @return string
	 */
	function koorosh_existing_page_url( $slug ) {
		$page = get_page_by_path( $slug );

		if ( ! $page instanceof WP_Post || 'publish' !== $page->post_status ) {
			return '';
		}

		$permalink = get_permalink( $page );

		return is_string( $permalink ) ? $permalink : '';
	}
endif;

$koorosh_recovery_links = array(
	array(
		'url'   => home_url( '/' ),
		'label' => 'رفتن به صفحهٔ نخست',
	),
);

$koorosh_product_url = koorosh_existing_page_url( 'product-overview' );
if ( '' !== $koorosh_product_url ) {
	$koorosh_recovery_links[] = array(
		'url'   => $koorosh_product_url,
		'label' => 'معرفی محصول',
	);
}

$koorosh_demo_url = koorosh_existing_page_url( 'demo' );
if ( '' !== $koorosh_demo_url ) {
	$koorosh_recovery_links[] = array(
		'url'   => $koorosh_demo_url,
		'label' => 'درخواست دمو / مشاوره',
	);
}
?>
<main id="content" class="error-404" tabindex="-1">
	<div class="site-container error-404__inner">
		<h1 class="error-404__title">صفحه‌ای که دنبال آن بودید پیدا نشد</h1>
		<p class="error-404__text">
			نشانی درخواست‌شده در این سایت وجود ندارد؛ ممکن است نشانی اشتباه تایپ شده باشد یا آن صفحه هرگز ساخته نشده باشد.
		</p>
		<p class="error-404__text">
			از مسیرهای زیر می‌توانید ادامه دهید:
		</p>
		<ul class="error-404__links">
			<?php foreach ( $koorosh_recovery_links as $koorosh_link ) : ?>
				<li><a href="<?php echo esc_url( $koorosh_link['url'] ); ?>"><?php echo esc_html( $koorosh_link['label'] ); ?></a></li>
			<?php endforeach; ?>
		</ul>
		<p class="error-404__text error-404__note">
			فهرست کامل بخش‌های سایت در ناوبری بالا و پایین همین صفحه در دسترس است.
		</p>
	</div>
</main>
<?php
get_footer();
