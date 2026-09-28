/**
 * Progressive enhancement for CPMS Demo Qualification Form.
 *
 * When JavaScript is active, intercepts submit for instant accessible feedback
 * without full page reload. Focuses error summary or non-live notice.
 * Falls back naturally to standard HTTP POST if JavaScript is disabled.
 */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('cpms-demo-form');
  var wrapper = document.getElementById('cpms-demo-form-wrapper');
  if (!form || !wrapper) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var submitBtn = document.getElementById('cpms-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    }

    // Clean up existing dynamic notices
    var oldSummary = document.getElementById('cpms-form-error-summary');
    if (oldSummary) oldSummary.remove();
    var oldSuccess = document.getElementById('cpms-form-success-notice');
    if (oldSuccess) oldSuccess.remove();
    wrapper.querySelectorAll('.cpms-form-error').forEach(function (el) { el.remove(); });
    wrapper.querySelectorAll('[aria-invalid="true"]').forEach(function (el) { el.removeAttribute('aria-invalid'); });

    var formData = new FormData(form);
    formData.append('cpms_ajax', '1');

    fetch(window.location.href, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .then(function (result) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute('aria-busy');
        }

        if (result.ok && result.data && result.data.success) {
          var notice = document.createElement('div');
          notice.className = 'cpms-form-notice cpms-form-notice--success';
          notice.id = 'cpms-form-success-notice';
          notice.setAttribute('role', 'status');
          notice.setAttribute('aria-live', 'polite');
          notice.setAttribute('tabindex', '-1');

          var title = document.createElement('p');
          title.className = 'cpms-form-notice__title';
          title.innerHTML = '<strong>درخواست آزمایشی شما با موفقیت بررسی شد</strong>';
          notice.appendChild(title);

          var desc = document.createElement('p');
          desc.className = 'cpms-form-notice__desc';
          desc.textContent = (result.data.data && result.data.data.message) ||
            'با توجه به وضعیت پیش‌نمایش فنی سایت، تحویل زندهٔ لیدها به ایمیل یا CRM هنوز فعال نشده و هیچ داده‌ای ذخیره یا ارسال نگردید. پس از اتصال نهایی کانال رسمی ارتباطی، درخواست‌های واقعی دریافت خواهند شد.';
          notice.appendChild(desc);

          form.parentNode.insertBefore(notice, form);
          form.reset();
          notice.focus();
        } else {
          var errorData = (result.data && result.data.data) ? result.data.data : {};
          var errors = errorData.errors || {};
          var globalMessage = errorData.message || 'خطا در بررسی اطلاعات فرم.';

          var summary = document.createElement('div');
          summary.className = 'cpms-form-notice cpms-form-notice--error';
          summary.id = 'cpms-form-error-summary';
          summary.setAttribute('role', 'alert');
          summary.setAttribute('tabindex', '-1');

          var sumTitle = document.createElement('p');
          sumTitle.className = 'cpms-form-notice__title';
          sumTitle.innerHTML = '<strong>' + globalMessage + '</strong>';
          summary.appendChild(sumTitle);

          var fieldKeys = Object.keys(errors);
          if (fieldKeys.length > 0) {
            var list = document.createElement('ul');
            list.className = 'cpms-form-notice__list';
            fieldKeys.forEach(function (fieldKey) {
              var errText = errors[fieldKey];
              var li = document.createElement('li');
              var a = document.createElement('a');
              a.href = '#cpms-field-' + fieldKey;
              a.textContent = errText;
              li.appendChild(a);
              list.appendChild(li);

              var fieldDiv = document.getElementById('cpms-field-' + fieldKey);
              if (fieldDiv) {
                var input = fieldDiv.querySelector('input, select, textarea');
                if (input) {
                  input.setAttribute('aria-invalid', 'true');
                  var errP = document.createElement('p');
                  errP.id = 'cpms-err-' + fieldKey.replace(/_/g, '-');
                  errP.className = 'cpms-form-error';
                  errP.setAttribute('role', 'alert');
                  errP.textContent = errText;
                  fieldDiv.appendChild(errP);
                }
              }
            });
            summary.appendChild(list);
          }

          form.parentNode.insertBefore(summary, form);
          summary.focus();
        }
      })
      .catch(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute('aria-busy');
        }
        form.submit();
      });
  });
});
