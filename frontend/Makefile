NGINX_HTML_DIR=/usr/share/nginx/html
NGINX_CONF_SOURCE=../ops/nginx/netric.conf
NGINX_CONF_TARGET=/etc/nginx/conf.d/netric.conf

re-compile:
	rm -rf dist/*
	npm run build
	sudo rm -rf $(NGINX_HTML_DIR)/*
	sudo cp -r dist/* $(NGINX_HTML_DIR)/
	sudo cp $(NGINX_CONF_SOURCE) $(NGINX_CONF_TARGET)
	sudo nginx -t
	sudo systemctl restart nginx
