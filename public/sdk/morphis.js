/**
 * Morphis SDK v1.0.0
 * AI-Powered Hot-Deploy UI Infrastructure
 * 
 * Usage:
 *   <script src="https://your-domain.com/sdk/morphis.js"></script>
 *   <script>
 *     Morphis.render({
 *       apiKey: 'your-api-key',
 *       intent: 'show a revenue chart',
 *       contextData: { mrr: 5000, churn: 2 },
 *       target: '#morphis-widget',
 *       theme: 'light'
 *     });
 *   </script>
 */
(function(global) {
  'use strict';

  var MORPHIS_API_URL = (function() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('morphis.js') !== -1) {
        var url = new URL(scripts[i].src);
        return url.origin;
      }
    }
    return window.location.origin;
  })();

  var Morphis = {
    _version: '1.0.0',
    _instances: [],

    /**
     * Render a Morphis UI component
     * @param {Object} config
     * @param {string} config.apiKey - Your Morphis API key
     * @param {string} config.intent - What UI to generate (e.g., "show a revenue chart")
     * @param {Object} [config.contextData={}] - Data to pass to the generated UI
     * @param {string} [config.target='#morphis-widget'] - CSS selector for the container
     * @param {string} [config.theme='light'] - Theme: 'light' or 'dark'
     * @param {Function} [config.onLoad] - Callback when UI is rendered
     * @param {Function} [config.onError] - Callback on error
     * @param {Function} [config.onMessage] - Callback for postMessage events from iframe
     */
    render: function(config) {
      if (!config || !config.apiKey) {
        console.error('[Morphis] apiKey is required');
        if (config && config.onError) config.onError(new Error('apiKey is required'));
        return;
      }
      if (!config.intent) {
        console.error('[Morphis] intent is required');
        if (config.onError) config.onError(new Error('intent is required'));
        return;
      }

      var target = document.querySelector(config.target || '#morphis-widget');
      if (!target) {
        console.error('[Morphis] Target element not found:', config.target || '#morphis-widget');
        if (config.onError) config.onError(new Error('Target element not found'));
        return;
      }

      // Show loading state
      target.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:200px;font-family:system-ui,sans-serif;color:#64748b;font-size:14px;"><div style="text-align:center;"><div style="width:24px;height:24px;border:2px solid #e2e8f0;border-top-color:#7BC53A;border-radius:50%;animation:morphis-spin 0.8s linear infinite;margin:0 auto 12px;"></div>Generating UI...</div></div>';

      // Add spinner animation
      if (!document.getElementById('morphis-styles')) {
        var style = document.createElement('style');
        style.id = 'morphis-styles';
        style.textContent = '@keyframes morphis-spin{to{transform:rotate(360deg)}}';
        document.head.appendChild(style);
      }

      // Call the Morphis API
      var payload = {
        apiKey: config.apiKey,
        intent: config.intent,
        contextData: config.contextData || {},
        theme: config.theme || 'light'
      };

      fetch(MORPHIS_API_URL + '/api/generate-ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function(response) {
        if (!response.ok) {
          return response.json().then(function(err) {
            throw new Error(err.error || 'API request failed');
          });
        }
        return response.json();
      })
      .then(function(data) {
        // Create sandboxed iframe
        var iframe = document.createElement('iframe');
        iframe.sandbox = 'allow-scripts';
        iframe.style.cssText = 'width:100%;border:none;min-height:200px;display:block;';
        iframe.title = 'Morphis Generated UI';
        iframe.srcdoc = data.html;

        // Auto-resize iframe based on content
        iframe.onload = function() {
          try {
            // Listen for resize messages from iframe content
            var resizeScript = '<script>new ResizeObserver(function(){window.parent.postMessage({type:"morphis-resize",height:document.body.scrollHeight},"*")}).observe(document.body);<\/script>';
            iframe.srcdoc = data.html.replace('</body>', resizeScript + '</body>');
          } catch(e) {
            // Fallback height
            iframe.style.height = '400px';
          }

          if (config.onLoad) {
            config.onLoad({
              metadata: data.metadata,
              iframe: iframe
            });
          }
        };

        // Clear loading and insert iframe
        target.innerHTML = '';
        target.appendChild(iframe);

        // Listen for postMessage from iframe
        var messageHandler = function(event) {
          if (event.source !== iframe.contentWindow) return;
          
          var msg = event.data;
          if (msg && msg.type === 'morphis-resize') {
            iframe.style.height = (msg.height + 20) + 'px';
          }
          if (config.onMessage) {
            config.onMessage(msg);
          }
        };
        window.addEventListener('message', messageHandler);

        // Store instance for cleanup
        Morphis._instances.push({
          target: target,
          iframe: iframe,
          messageHandler: messageHandler,
          config: config
        });
      })
      .catch(function(error) {
        console.error('[Morphis] Error:', error.message);
        target.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:200px;font-family:system-ui,sans-serif;color:#ef4444;font-size:14px;padding:20px;text-align:center;border:1px solid #fecaca;border-radius:8px;background:#fef2f2;">Error: ' + error.message + '</div>';
        if (config.onError) config.onError(error);
      });
    },

    /**
     * Destroy all Morphis instances and clean up
     */
    destroy: function() {
      Morphis._instances.forEach(function(instance) {
        window.removeEventListener('message', instance.messageHandler);
        if (instance.target) instance.target.innerHTML = '';
      });
      Morphis._instances = [];
    },

    /**
     * Update context data for an existing instance and re-render
     * @param {string} target - CSS selector of the target
     * @param {Object} newContextData - New data to pass
     */
    update: function(target, newContextData) {
      var instance = Morphis._instances.find(function(i) {
        return i.target === document.querySelector(target);
      });
      if (instance) {
        instance.config.contextData = newContextData;
        Morphis.render(instance.config);
      }
    }
  };

  // Expose globally
  global.Morphis = Morphis;

})(typeof window !== 'undefined' ? window : this);
