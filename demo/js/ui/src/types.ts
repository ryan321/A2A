export interface Types {
    $schema:     string;
    title:       string;
    description: string;
    $defs:       Defs;
}

export interface Defs {
    AgentAuthentication:               AgentAuthentication;
    AgentCapabilities:                 AgentCapabilities;
    AgentCard:                         AgentCard;
    AgentProvider:                     AgentProvider;
    AgentSkill:                        AgentSkill;
    Artifact:                          Artifact;
    AuthenticationInfo:                AgentAuthentication;
    PushNotificationNotSupportedError: MethodNotFoundErrorClass;
    CancelTaskRequest:                 Request;
    CancelTaskResponse:                Response;
    DataPart:                          DataPart;
    FileContent:                       FileContent;
    FilePart:                          FilePart;
    GetTaskPushNotificationRequest:    Request;
    GetTaskPushNotificationResponse:   Response;
    GetTaskRequest:                    Request;
    GetTaskResponse:                   Response;
    InternalError:                     InternalErrorClass;
    InvalidParamsError:                InternalErrorClass;
    InvalidRequestError:               InternalErrorClass;
    JSONParseError:                    InternalErrorClass;
    JSONRPCError:                      JSONRPCError;
    JSONRPCMessage:                    JSONRPCMessage;
    JSONRPCRequest:                    JSONRPCRequest;
    JSONRPCResponse:                   JSONRPCResponse;
    Message:                           Message;
    MethodNotFoundError:               MethodNotFoundErrorClass;
    PushNotificationConfig:            PushNotificationConfig;
    Part:                              Part;
    SendTaskRequest:                   Request;
    SendTaskResponse:                  Response;
    SendTaskStreamingRequest:          Request;
    SendTaskStreamingResponse:         SendTaskStreamingResponse;
    SetTaskPushNotificationRequest:    Request;
    SetTaskPushNotificationResponse:   Response;
    Task:                              Task;
    TaskPushNotificationConfig:        TaskPushNotificationConfig;
    TaskNotCancelableError:            MethodNotFoundErrorClass;
    TaskNotFoundError:                 MethodNotFoundErrorClass;
    TaskIdParams:                      TaskIDParams;
    TaskQueryParams:                   TaskQueryParams;
    TaskSendParams:                    TaskSendParams;
    TaskState:                         FileContent;
    TaskStatus:                        TaskStatus;
    TaskResubscriptionRequest:         Request;
    TaskStatusUpdateEvent:             TaskStatusUpdateEvent;
    TaskArtifactUpdateEvent:           TaskArtifactUpdateEvent;
    TextPart:                          TextPart;
    UnsupportedOperationError:         MethodNotFoundErrorClass;
    A2ARequest:                        A2ARequest;
}

export interface A2ARequest {
    oneOf: OneOf[];
    title: string;
}

export interface OneOf {
    $ref: string;
}

export interface AgentAuthentication {
    properties:            AgentAuthenticationProperties;
    required:              string[];
    title:                 string;
    type:                  AgentAuthenticationType;
    additionalProperties?: AdditionalProperties;
}

export interface AdditionalProperties {
}

export interface AgentAuthenticationProperties {
    schemes:     Schemes;
    credentials: Credentials;
}

export interface Credentials {
    type:  CredentialsType;
    title: string;
}

export enum CredentialsType {
    Boolean = "boolean",
    Integer = "integer",
    String = "string",
}

export interface Schemes {
    items:    Items;
    title:    string;
    type:     string;
    default?: string[];
}

export interface Items {
    type: CredentialsType;
}

export enum AgentAuthenticationType {
    Object = "object",
}

export interface AgentCapabilities {
    properties: AgentCapabilitiesProperties;
    title:      string;
    type:       AgentAuthenticationType;
}

export interface AgentCapabilitiesProperties {
    streaming:              PushNotifications;
    pushNotifications:      PushNotifications;
    stateTransitionHistory: PushNotifications;
}

export interface PushNotifications {
    default: boolean;
    title:   string;
    type:    CredentialsType;
}

export interface AgentCard {
    properties: AgentCardProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface AgentCardProperties {
    name:               Credentials;
    description:        Credentials;
    url:                Credentials;
    provider:           OneOf;
    version:            Credentials;
    documentationUrl:   Credentials;
    capabilities:       OneOf;
    authentication:     OneOf;
    defaultInputModes:  Schemes;
    defaultOutputModes: Schemes;
    skills:             Skills;
}

export interface Skills {
    items: OneOf;
    title: string;
    type:  string;
}

export interface AgentProvider {
    properties: AgentProviderProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface AgentProviderProperties {
    organization: Credentials;
    url:          Credentials;
}

export interface AgentSkill {
    properties: AgentSkillProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface AgentSkillProperties {
    id:          Credentials;
    name:        Credentials;
    description: Credentials;
    tags:        Schemes;
    examples:    Schemes;
    inputModes:  Schemes;
    outputModes: Schemes;
}

export interface Artifact {
    properties: ArtifactProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface ArtifactProperties {
    name:        Credentials;
    description: Credentials;
    parts:       Skills;
    index:       Index;
    append:      Credentials;
    lastChunk:   Credentials;
    metadata:    Metadata;
}

export interface Index {
    type:    CredentialsType;
    default: number;
    title:   string;
}

export interface Metadata {
    additionalProperties: AdditionalProperties;
    type:                 AgentAuthenticationType;
    title:                MetadataTitle;
}

export enum MetadataTitle {
    Data = "Data",
    Metadata = "Metadata",
    Params = "Params",
    Result = "Result",
}

export interface Request {
    properties: CancelTaskRequestProperties;
    required:   CancelTaskRequestRequired[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface CancelTaskRequestProperties {
    jsonrpc: Jsonrpc;
    id:      ID;
    method:  Jsonrpc;
    params:  OneOf;
}

export interface ID {
    anyOf: Items[];
    title: IDTitle;
}

export enum IDTitle {
    ID = "Id",
}

export interface Jsonrpc {
    const:   string;
    default: string;
    title:   JsonrpcTitle;
    type:    CredentialsType;
}

export enum JsonrpcTitle {
    Jsonrpc = "Jsonrpc",
    Method = "Method",
}

export enum CancelTaskRequestRequired {
    Method = "method",
    Params = "params",
}

export interface Response {
    properties: CancelTaskResponseProperties;
    title:      string;
    type:       AgentAuthenticationType;
}

export interface CancelTaskResponseProperties {
    jsonrpc: Jsonrpc;
    id:      ID;
    result:  OneOf;
    error:   OneOf;
}

export interface DataPart {
    properties: DataPartProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface DataPartProperties {
    type:     TypeClass;
    data:     Metadata;
    metadata: Metadata;
}

export interface TypeClass {
    const:       string;
    default:     string;
    description: Description;
    examples:    string[];
    title:       TypeTitle;
    type:        CredentialsType;
}

export enum Description {
    AShortDescriptionOfTheError = "A short description of the error",
    TypeOfThePart = "Type of the part",
}

export enum TypeTitle {
    Message = "Message",
    Type = "Type",
}

export interface FileContent {
    properties?: FileContentProperties;
    title:       string;
    type:        string;
    description: string;
    enum?:       string[];
}

export interface FileContentProperties {
    name:     Credentials;
    mimeType: Credentials;
    bytes:    Credentials;
    uri:      Credentials;
}

export interface FilePart {
    properties: FilePartProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface FilePartProperties {
    type:     TypeClass;
    file:     OneOf;
    metadata: Metadata;
}

export interface InternalErrorClass {
    properties: InternalErrorProperties;
    required:   InternalErrorRequired[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface InternalErrorProperties {
    code:    Code;
    message: TypeClass;
    data:    Metadata;
}

export interface Code {
    const:       number;
    default:     number;
    description: string;
    examples:    number[];
    title:       string;
    type:        CredentialsType;
}

export enum InternalErrorRequired {
    Code = "code",
    Message = "message",
}

export interface JSONRPCError {
    properties: JSONRPCErrorProperties;
    required:   InternalErrorRequired[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface JSONRPCErrorProperties {
    code:    Credentials;
    message: Credentials;
    data:    Metadata;
}

export interface JSONRPCMessage {
    properties: JSONRPCMessageProperties;
    title:      string;
    type:       AgentAuthenticationType;
}

export interface JSONRPCMessageProperties {
    jsonrpc: Jsonrpc;
    id:      ID;
}

export interface JSONRPCRequest {
    properties: JSONRPCRequestProperties;
    required:   CancelTaskRequestRequired[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface JSONRPCRequestProperties {
    jsonrpc: Jsonrpc;
    id:      ID;
    method:  Credentials;
    params:  Metadata;
}

export interface JSONRPCResponse {
    properties: JSONRPCResponseProperties;
    title:      string;
    type:       AgentAuthenticationType;
}

export interface JSONRPCResponseProperties {
    jsonrpc: Jsonrpc;
    id:      ID;
    result:  Metadata;
    error:   OneOf;
}

export interface Message {
    properties: MessageProperties;
    required:   string[];
    title:      TypeTitle;
    type:       AgentAuthenticationType;
}

export interface MessageProperties {
    role:     Role;
    parts:    Skills;
    metadata: Metadata;
}

export interface Role {
    enum:  string[];
    title: string;
    type:  CredentialsType;
}

export interface MethodNotFoundErrorClass {
    properties: MethodNotFoundErrorProperties;
    required:   InternalErrorRequired[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface MethodNotFoundErrorProperties {
    code:    Code;
    message: TypeClass;
    data:    Data;
}

export interface Data {
    title: MetadataTitle;
}

export interface Part {
    anyOf: OneOf[];
    title: string;
}

export interface PushNotificationConfig {
    properties: PushNotificationConfigProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface PushNotificationConfigProperties {
    url:            Credentials;
    token:          Credentials;
    authentication: OneOf;
}

export interface SendTaskStreamingResponse {
    properties: SendTaskStreamingResponseProperties;
    title:      string;
    type:       AgentAuthenticationType;
}

export interface SendTaskStreamingResponseProperties {
    jsonrpc: Jsonrpc;
    id:      ID;
    result:  Result;
    error:   OneOf;
}

export interface Result {
    anyOf: OneOf[];
}

export interface Task {
    properties: TaskProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface TaskProperties {
    id:        Credentials;
    sessionId: Credentials;
    status:    OneOf;
    artifacts: Skills;
    history:   Skills;
    metadata:  Metadata;
}

export interface TaskArtifactUpdateEvent {
    properties: TaskArtifactUpdateEventProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface TaskArtifactUpdateEventProperties {
    id:       Credentials;
    artifact: OneOf;
    metadata: Metadata;
}

export interface TaskIDParams {
    properties: TaskIDParamsProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface TaskIDParamsProperties {
    id:       Credentials;
    metadata: Metadata;
}

export interface TaskPushNotificationConfig {
    properties: TaskPushNotificationConfigProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface TaskPushNotificationConfigProperties {
    id:                     Credentials;
    pushNotificationConfig: OneOf;
}

export interface TaskQueryParams {
    properties: TaskQueryParamsProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface TaskQueryParamsProperties {
    id:            Credentials;
    historyLength: Credentials;
    metadata:      Metadata;
}

export interface TaskSendParams {
    properties: TaskSendParamsProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface TaskSendParamsProperties {
    id:               Credentials;
    sessionId:        Credentials;
    message:          OneOf;
    pushNotification: OneOf;
    historyLength:    Credentials;
    metadata:         Metadata;
}

export interface TaskStatus {
    properties: TaskStatusProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface TaskStatusProperties {
    state:     OneOf;
    message:   OneOf;
    timestamp: Timestamp;
}

export interface Timestamp {
    format: string;
    title:  string;
    type:   CredentialsType;
}

export interface TaskStatusUpdateEvent {
    properties: TaskStatusUpdateEventProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface TaskStatusUpdateEventProperties {
    id:       Credentials;
    status:   OneOf;
    final:    PushNotifications;
    metadata: Metadata;
}

export interface TextPart {
    properties: TextPartProperties;
    required:   string[];
    title:      string;
    type:       AgentAuthenticationType;
}

export interface TextPartProperties {
    type:     TypeClass;
    text:     Credentials;
    metadata: Metadata;
}
