re-compile:
	rm -rf dist/*
	npm run build
	sudo rm -rf /usr/share/nginx/html/*
	sudo cp -r dist/* /usr/share/nginx/html/
	sudo systemctl restart nginx
