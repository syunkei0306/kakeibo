import { defineConfig, normalizePath } from "vite";
import path from "path";
import handlebars from "vite-plugin-handlebars";
import { fileURLToPath } from "url";
import { viteStaticCopy } from "vite-plugin-static-copy";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commonData = {
  appTitle: "家計簿システム",
};

const pageData = {
  "/": {
    title: "メニュー",
    pageName: "menu",
  },
  "/menu.html": {
    title: "メニュー",
    pageName: "menu",
  },
  "/error.html": {
    title: "エラー",
    pageName: "error",
  },
};

export default defineConfig((mode) => {
  const drop = ["debugger"];
  if (mode.mode === "release") {
    drop.push("console");
  }
  return {
    esbuild: {
      drop: drop,
    },
    root: path.resolve(__dirname, "src"),
    base: "/",
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["mixed-decls"],
        },
      },
    },
    build: {
      sourcemap: true,
      emptyOutDir: true,
      outDir: "../../resources/static", //出力場所の指定
      assetsDir: "assets/",
      modulePreload: false,
      rollupOptions: {
        input: {
          menu: path.resolve(__dirname, "src/menu.html"),
          error: path.resolve(__dirname, "src/error.html"),
        },
      },
    },
    resolve: {
      alias: {
        "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
        "~bootstrap-icons": path.resolve(
          __dirname,
          "node_modules/bootstrap-icons"
        ),
      },
    },
    server: {
      port: 5173,
      hot: true,
      open: "/menu.html",
    },
    plugins: [
      handlebars({
        //コンポーネントの格納ディレクトリを指定
        partialDirectory: path.resolve(__dirname, "./src/component/html"), //各ページ情報の読み込み
        context(pagePath) {
          // pageDataに情報がない場合、共通データとデフォルトのタイトルを適用
          const pageInfo = pageData[pagePath] || {
            // ファイル名から拡張子とパスを除去してタイトルに設定
            title: path
              .basename(pagePath, ".html")
              .replace(/-/g, " ")
              .toUpperCase(),
            pageName: path.basename(pagePath, ".html"),
          };
          return Object.assign({}, pageInfo, commonData);
        },
      }),
      viteStaticCopy({
        targets: [
          {
            src: normalizePath(path.resolve(__dirname, "src/resources/*")),
            dest: normalizePath(
              path.resolve(__dirname, "../resources/static/resources")
            ),
          },
          {
            src: normalizePath(
              path.resolve(__dirname, "src/resources/favicon.ico")
            ),
            dest: normalizePath(path.resolve(__dirname, "../resources/static")),
          },
        ],
      }),
      {
        name: "move-html-files",
        closeBundle() {
          const staticPath = path.resolve(__dirname, "../resources/static");
          const templatesPath = path.resolve(
            path.dirname(staticPath),
            "templates"
          ); // templatesディレクトリがなければ作成

          if (!fs.existsSync(templatesPath)) {
            fs.mkdirSync(templatesPath, { recursive: true });
          } // staticディレクトリ内のhtmlファイルをtemplatesディレクトリに移動

          try {
            const files = fs.readdirSync(staticPath);
            const htmlFiles = files.filter((file) => file.endsWith(".html"));

            htmlFiles.forEach((file) => {
              const src = path.join(staticPath, file);
              const dest = path.join(templatesPath, file);
              fs.renameSync(src, dest);
            });
          } catch (err) {
            console.error("Error moving HTML files:", err);
          }
        },
      },
    ],
    envDir: path.resolve(__dirname, "env"),
  };
});
