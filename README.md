# kakeibo

Java + Spring Boot + PostgreSQL + Vite を使った家計簿管理アプリケーションです。Docker で開発環境を構築し、バックエンドとフロントエンドを分離して管理しています。

## 技術構成

- Java 17 / Spring Boot
- Gradle
- PostgreSQL（Docker）
- Vite / npm（フロントエンド）
- Docker / docker-compose

## ディレクトリ構成

kakeibo/ ├── docker-compose.yml ├── build.gradle ├── settings.gradle ├── .gitignore ├── src/ │ ├── backend/ # Spring Boot アプリケーション │ └── frontend/ # Vite + npm フロントエンド

## セットアップ手順

### 前提条件

- Docker Desktop
- Git
- Node.js（推奨: v18 以上）
- JDK（推奨: 17）

### 初期化手順

````bash
git clone https://github.com/syunkei0306/kakeibo.git
cd kakeibo
docker-compose up -d
cd src/frontend
npm install
npm run dev

### ⑤ 環境変数（Environment Variables）

```markdown
## 環境変数

`.env` ファイルは `.gitignore` に含めてください。共有用に `.env.example` を用意しています。

```env
POSTGRES_USER=keito
POSTGRES_PASSWORD=secret
POSTGRES_DB=kakeibo


→ `.env` を直接共有せず、テンプレートを提供するのがベストプラクティス

---

### ⑥ よくあるエラーと対処法（Optional）

```markdown
## よくあるエラーと対処法

- `Error: out of memory allocating heap arena map`
  → `NODE_OPTIONS=--max-old-space-size=4096` を設定してから `npm run build` を実行

- `Permission denied`（Windows）
  → PowerShellを「管理者として実行」してください
````

## ライセンス

MIT License

## 作者

- GitHub: [syunkei0306](https://github.com/syunkei0306)
