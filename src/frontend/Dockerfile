# Node.jsベースイメージ
FROM node:18

WORKDIR /app

# 依存関係インストール
COPY package*.json ./
RUN npm install

# ソースコードコピー
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]