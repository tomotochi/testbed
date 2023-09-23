# 開発手順

## セットアップ

Windows/Mac共通でインストール
- Visual Studio Code
- Docker Desktop

Windowsの場合、追加インストール
- WSL 2
- [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)

## 検証環境

サンプルをコピーして`.env.development`を作成し、検証環境のトークンを記述しておきます。
トークンのありかや、安全な受け渡し方法については、Discordで確認してください。

```
cp .env.sample .env.development
```

ローカルでビルドしてbotを起動します。

```
docker compose build
docker compose run bot 
```
