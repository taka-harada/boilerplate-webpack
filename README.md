# Introduction
This boilerplate use the following technologies.

# Technologies
## Frontend
 - webpack(module bundler)
 - yarn(package manager)
 - pug(html template engine)
 - FLOCSS(CSS Methodologies)
 - SCSS(CSS Processor)
 - ES6 for JavaScript
 - jQuery(JS Framework)
 - backbone.js(JS Framework)
 - underscore.js(JS Framework)

# Initial setting
## 1.clone this repository on your local
## 2.run `yarn install` for dependancies

# Structure

```
├── config
|     └── webpack.config.js  # webpackの設定ファイル
├── src                      # エントリーポイントのファイル群を格納する
|     ├── font               # fontファイルを格納する
|     ├── img                # イメージファイルを格納する
|     ├── js                 # jsファイルを格納する
|     ├── pug                # pugファイルを格納する
|     └── scss               # scssファイルを格納する
├── package.json             # パッケージのバージョン情報
├── yarn.lock                # パッケージのバージョン情報
├── node_modules/            # yarn(npm)でインストールされたパッケージなどがはいっている。
├── .editorconfig            # エディターの設定
├── .eslintrc                # ESlintの設定
├── .stylelintrc             # Stylelintの設定
└── wordpress/               # WordPress関連のファイル群を格納する。バンドルされたファイルは直接themeフォルダに格納される設定。
```

# How to start development
When you start to develop, Please run the follwing command.

## Build

```
$ yarn run build
```

## Launch webpack dev server

```
$ yarn run start
```
