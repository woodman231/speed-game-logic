type Entity<TId, TProps> = {
    id: TId;
} & {
    // This loops through every key in TProps and matches its type
    [K in keyof TProps]: TProps[K];
};

export type { Entity };
