#!/bin/sh
# Container-only workaround: Chromium refuses to run as root without --no-sandbox. Used via IMPECCABLE_BROWSER.
exec /opt/pw-browsers/chromium "$@" --no-sandbox --disable-dev-shm-usage
