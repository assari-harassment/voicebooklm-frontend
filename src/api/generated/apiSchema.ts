/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface FallbackUsageResponse {
  transcription: boolean;
  formatting: boolean;
}

export interface ProcessingTimeResponse {
  /** @format int64 */
  transcription: number;
  /** @format int64 */
  formatting: number;
  /** @format int64 */
  persistence: number;
  /** @format int64 */
  total: number;
}

export interface VoiceMemoCreatedResponse {
  /** @format uuid */
  memoId: string;
  title: string;
  content: string;
  tags: string[];
  transcription?: string;
  transcriptionStatus: string;
  formattingStatus: string;
  processingTimeMillis: ProcessingTimeResponse;
  fallback: FallbackUsageResponse;
}

/** エラーレスポンス */
export interface ErrorResponse {
  /**
   * エラーメッセージ
   * @example "認証に失敗しました"
   */
  error: string;
  /**
   * エラーコード
   * @example "UNAUTHORIZED"
   */
  code: string;
}

export interface MemoDetailResponse {
  /** @format uuid */
  memoId: string;
  title?: string;
  content?: string;
  tags: string[];
  transcriptionText?: string;
  transcriptionStatus: string;
  formattingStatus: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ResummarizeRequest {
  editedTranscription: string;
}

export interface FolderResponse {
  /** @format uuid */
  id: string;
  name: string;
  /** @format uuid */
  parentId?: string;
  path: string;
  /** @format int32 */
  memoCount: number;
}

export interface CreateFolderRequest {
  /**
   * @minLength 0
   * @maxLength 50
   */
  name: string;
  /** @format uuid */
  parentId?: string;
}

/** 開発用トークン取得レスポンス */
export interface DevTokenResponse {
  /** アクセストークン（JWT） */
  accessToken: string;
  /** ユーザーID */
  userId: string;
  /** メールアドレス */
  email: string;
  /** 使い方の説明 */
  message: string;
}

/** 開発用シードデータ作成レスポンス */
export interface DevSeedResponse {
  /**
   * 作成されたフォルダー数
   * @format int32
   */
  foldersCreated: number;
  /**
   * 作成されたメモ数
   * @format int32
   */
  memosCreated: number;
  /** スキップされたかどうか（既存データがある場合） */
  skipped: boolean;
  /** 結果メッセージ */
  message: string;
}

/** トークンリフレッシュリクエスト */
export interface RefreshTokenRequest {
  /**
   * リフレッシュトークン
   * @example "eyJhbGciOiJIUzI1NiIsInR"
   */
  refreshToken: string;
}

/** 認証トークンレスポンス */
export interface TokenResponse {
  /**
   * アクセストークン（1日有効）
   * @example "eyJhbGciOiJIUzI1NiIsInR"
   */
  accessToken: string;
  /**
   * リフレッシュトークン（180日間有効）
   * @example "eyJhbGciOiJIUzI1NiIsInR"
   */
  refreshToken: string;
}

/** ログアウトリクエスト */
export interface LogoutRequest {
  /**
   * リフレッシュトークン
   * @example "eyJhbGciOiJIUzI1NiIsInR"
   */
  refreshToken: string;
}

/** Google OAuth ログインリクエスト */
export interface GoogleAuthRequest {
  /**
   * Google ID トークン
   * @example "eyJhbGciOiJSUzI1NiIsInR"
   */
  idToken: string;
}

export interface UpdateMemoRequest {
  /**
   * @minLength 0
   * @maxLength 100
   */
  title?: string;
  content?: string;
  tags?: string[];
}

export interface UpdateFolderRequest {
  /**
   * @minLength 0
   * @maxLength 50
   */
  name?: string;
  /** @format uuid */
  parentId?: string;
  moveToRoot: boolean;
}

/** タグ一覧レスポンス */
export interface TagsResponse {
  /**
   * タグ名のリスト
   * @example ["開発","コード","ミーティング"]
   */
  tags: string[];
}

export interface FolderInfo {
  /** @format uuid */
  id: string;
  name: string;
  path: string;
}

export interface ListMemosResponse {
  memos: MemoListItemResponse[];
  /** @format int32 */
  total: number;
  hasMore: boolean;
}

export interface MemoListItemResponse {
  /** @format uuid */
  memoId: string;
  title?: string;
  tags: string[];
  transcriptionStatus: string;
  formattingStatus: string;
  folder?: FolderInfo;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface TranscriptionResponse {
  transcription: string;
}

export interface ListFoldersResponse {
  folders: FolderResponse[];
}

/** ユーザー情報レスポンス */
export interface UserResponse {
  /**
   * ユーザー ID
   * @format uuid
   * @example "01916f54-1234-7abc-def0-123456789abc"
   */
  id: string;
  /**
   * メールアドレス
   * @example "user@example.com"
   */
  email: string;
  /**
   * ユーザー名
   * @example "田中太郎"
   */
  name: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from 'axios';
import axios from 'axios';

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<
  AxiosRequestConfig,
  'data' | 'params' | 'url' | 'responseType'
> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<
  AxiosRequestConfig,
  'data' | 'cancelToken'
> {
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = 'application/json',
  JsonApi = 'application/vnd.api+json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || 'http://localhost:8080',
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === 'object') {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== 'string') {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { 'Content-Type': type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title VoiceBook LM API
 * @version 0.0.1-SNAPSHOT
 * @license Private (https://voicebooklm.example.com/license)
 * @baseUrl http://localhost:8080
 * @contact VoiceBook LM Team <support@voicebooklm.example.com>
 *
 * AI ボイスメモアプリケーションのバックエンド API
 *
 * ## 機能
 * - ユーザー認証・認可（JWT）
 * - 音声ファイルのアップロード・管理
 * - AI による音声認識・文字起こし
 * - 音声メモの検索・フィルタ
 *
 * ## React Native との連携
 * - CORS 設定済み
 * - JWT トークン認証
 * - TypeScript 型定義の生成が可能
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description multipart/form-data で音声ファイルをアップロードし、文字起こし→AI整形→保存を行う。60秒以内のレスポンスを想定。
     *
     * @tags Voice
     * @name CreateMemo
     * @summary 音声ファイルからメモを生成する
     * @request POST:/api/voice/memos
     * @secure
     */
    createMemo: (
      data: {
        /** @format binary */
        file: File;
      },
      query?: {
        language?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<VoiceMemoCreatedResponse, ErrorResponse>({
        path: `/api/voice/memos`,
        method: 'POST',
        query: query,
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * @description 編集された文字起こしテキストから再度AI整形（要約）を行います。
     *
     * @tags Memo
     * @name Resummarize
     * @summary メモ再要約
     * @request POST:/api/memos/{id}/resummarize
     * @secure
     */
    resummarize: (id: string, data: ResummarizeRequest, params: RequestParams = {}) =>
      this.request<MemoDetailResponse, ErrorResponse>({
        path: `/api/memos/${id}/resummarize`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 認証ユーザーのフォルダー一覧をパス情報付きで取得する。
     *
     * @tags Folder
     * @name ListFolders
     * @summary フォルダー一覧取得
     * @request GET:/api/folders
     * @secure
     */
    listFolders: (params: RequestParams = {}) =>
      this.request<ListFoldersResponse, ErrorResponse>({
        path: `/api/folders`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description 新しいフォルダーを作成する。親フォルダーを指定して階層構造を作成可能。
     *
     * @tags Folder
     * @name CreateFolder
     * @summary フォルダー作成
     * @request POST:/api/folders
     * @secure
     */
    createFolder: (data: CreateFolderRequest, params: RequestParams = {}) =>
      this.request<FolderResponse, ErrorResponse>({
        path: `/api/folders`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 指定したメールアドレスのユーザーのアクセストークンを取得する。 OAuth不要で、Swagger UIからすぐにAPIテストができる。 **注意**: dev 環境でのみ有効。本番環境では使用不可。
     *
     * @tags Dev
     * @name GetToken
     * @summary 開発用トークン取得
     * @request POST:/api/dev/token
     * @secure
     */
    getToken: (
      query: {
        /** ユーザーのメールアドレス */
        email: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<DevTokenResponse, DevTokenResponse>({
        path: `/api/dev/token`,
        method: 'POST',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 認証ユーザー用にテスト用のフォルダーとメモを作成する。 データは seed-data.yml から読み込まれる。 冪等性を持ち、既にフォルダーが存在する場合はスキップする。
     *
     * @tags Dev
     * @name Seed
     * @summary テストデータ作成
     * @request POST:/api/dev/seed
     * @secure
     */
    seed: (params: RequestParams = {}) =>
      this.request<DevSeedResponse, DevSeedResponse>({
        path: `/api/dev/seed`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description リフレッシュトークンを使用して新しいトークンペアを発行します（トークンローテーション）。
     *
     * @tags Authentication
     * @name RefreshToken
     * @summary トークンリフレッシュ
     * @request POST:/api/auth/refresh
     * @secure
     */
    refreshToken: (data: RefreshTokenRequest, params: RequestParams = {}) =>
      this.request<TokenResponse, ErrorResponse>({
        path: `/api/auth/refresh`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description リフレッシュトークンを無効化してログアウトします。
     *
     * @tags Authentication
     * @name Logout
     * @summary ログアウト
     * @request POST:/api/auth/logout
     * @secure
     */
    logout: (data: LogoutRequest, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/api/auth/logout`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Google ID トークンを検証し、JWT トークンペアを発行します。新規ユーザーの場合はアカウントを作成します。
     *
     * @tags Authentication
     * @name LoginWithGoogle
     * @summary Google OAuth ログイン
     * @request POST:/api/auth/google
     * @secure
     */
    loginWithGoogle: (data: GoogleAuthRequest, params: RequestParams = {}) =>
      this.request<TokenResponse, ErrorResponse>({
        path: `/api/auth/google`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 指定されたIDのメモの詳細情報を取得します。セキュリティ上、権限のないメモも404として返します。
     *
     * @tags Memo
     * @name GetMemo
     * @summary メモ詳細取得
     * @request GET:/api/memos/{id}
     * @secure
     */
    getMemo: (id: string, params: RequestParams = {}) =>
      this.request<MemoDetailResponse, ErrorResponse>({
        path: `/api/memos/${id}`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description 指定されたメモを削除します。
     *
     * @tags Memo
     * @name DeleteMemo
     * @summary メモ削除
     * @request DELETE:/api/memos/{id}
     * @secure
     */
    deleteMemo: (id: string, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/api/memos/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description メモの部分更新を行います。指定されたフィールドのみ更新されます。
     *
     * @tags Memo
     * @name UpdateMemo
     * @summary メモ更新
     * @request PATCH:/api/memos/{id}
     * @secure
     */
    updateMemo: (id: string, data: UpdateMemoRequest, params: RequestParams = {}) =>
      this.request<MemoDetailResponse, ErrorResponse>({
        path: `/api/memos/${id}`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description フォルダーを削除する。子フォルダーまたはメモが存在する場合は削除できない。
     *
     * @tags Folder
     * @name DeleteFolder
     * @summary フォルダー削除
     * @request DELETE:/api/folders/{id}
     * @secure
     */
    deleteFolder: (id: string, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/api/folders/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description フォルダーのリネームまたは移動を行う。両方同時に指定可能。
     *
     * @tags Folder
     * @name UpdateFolder
     * @summary フォルダー更新
     * @request PATCH:/api/folders/{id}
     * @secure
     */
    updateFolder: (id: string, data: UpdateFolderRequest, params: RequestParams = {}) =>
      this.request<FolderResponse, ErrorResponse>({
        path: `/api/folders/${id}`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 認証ユーザーが使用している全タグを取得する。 ソート順と件数制限が指定可能。 例：）人気タグを取得する場合: sort=usage_count&order=desc&limit=10
     *
     * @tags Tag
     * @name ListTags
     * @summary タグ一覧取得
     * @request GET:/api/tags
     * @secure
     */
    listTags: (
      query?: {
        /**
         * ソート項目（name: 名前順, usage_count: 使用回数順）
         * @default "name"
         */
        sort?: string;
        /**
         * ソート順序（asc, desc）
         * @default "asc"
         */
        order?: string;
        /**
         * 取得件数制限
         * @format int32
         */
        limit?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<TagsResponse, ErrorResponse>({
        path: `/api/tags`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 認証ユーザーのメモを取得する。フォルダーによるフィルタリング、キーワード検索、ソート、ページネーションが可能。
     *
     * @tags Memo
     * @name ListMemos
     * @summary メモ一覧取得
     * @request GET:/api/memos
     * @secure
     */
    listMemos: (
      query?: {
        /**
         * フォルダーIDでフィルタリング
         * @format uuid
         */
        folderId?: string;
        /**
         * true の場合、子孫フォルダーのメモも含める
         * @default false
         */
        includeDescendants?: boolean;
        /**
         * true の場合、未分類メモのみ取得
         * @default false
         */
        uncategorizedOnly?: boolean;
        /** キーワード検索（タイトルまたはコンテントに含まれるメモを検索） */
        keyword?: string;
        /** タグでフィルタリング（AND検索: 指定されたすべてのタグを持つメモを取得） */
        tags?: string[];
        /**
         * ソート項目（updated_at, created_at, title）
         * @default "updated_at"
         */
        sort?: string;
        /**
         * ソート順序（asc, desc）
         * @default "desc"
         */
        order?: string;
        /**
         * 取得件数制限
         * @format int32
         */
        limit?: number;
        /**
         * 取得開始位置（0から開始）
         * @format int32
         */
        offset?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<ListMemosResponse, ErrorResponse>({
        path: `/api/memos`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 指定されたIDのメモの文字起こしテキストを取得します。再要約画面で使用します。
     *
     * @tags Memo
     * @name GetTranscription
     * @summary 文字起こしテキスト取得
     * @request GET:/api/memos/{id}/transcription
     * @secure
     */
    getTranscription: (id: string, params: RequestParams = {}) =>
      this.request<TranscriptionResponse, ErrorResponse>({
        path: `/api/memos/${id}/transcription`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description 認証済みユーザーの情報を取得します。
     *
     * @tags Authentication
     * @name GetCurrentUser
     * @summary 現在のユーザー情報取得
     * @request GET:/api/auth/me
     * @secure
     */
    getCurrentUser: (params: RequestParams = {}) =>
      this.request<UserResponse, ErrorResponse>({
        path: `/api/auth/me`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description ユーザーアカウントとすべての関連データを完全に削除します。
     *
     * @tags Authentication
     * @name DeleteAccount
     * @summary アカウント削除
     * @request DELETE:/api/auth/account
     * @secure
     */
    deleteAccount: (params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/api/auth/account`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),
  };
}
