# Java 17ベースイメージ
FROM eclipse-temurin:17-jdk

# 作業ディレクトリ
WORKDIR /app

# jarファイルをコピー（Gradleビルド後に生成される）
COPY build/libs/*.jar app.jar

# ポート開放
EXPOSE 8080

# 実行コマンド（メモリ制限付き）
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]