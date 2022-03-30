export type OptionalExceptFor<T, TRequired extends keyof T> = Partial<T> & Pick<T, TRequired>
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<DeepPartial<U>> : T[P] extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : DeepPartial<T[P]> | T[P];
}