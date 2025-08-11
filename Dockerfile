# Usa imagem leve do nginx para servir o app
FROM nginx:alpine

# Copia os arquivos da build para o diretório padrão do nginx
COPY ./dist/vanessa-studio-angular/browser /usr/share/nginx/html

# Expõe a porta 80 (nginx roda nessa porta)
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]