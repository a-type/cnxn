declare module 'orbit-db-identity-provider' {
  export class Identity {
    constructor(
      id: string,
      publicKey: string,
      idSignature: string,
      pubKeyIdSignature: string,
      type: string,
      provider: any,
    );
    readonly id: string;
    readonly publicKey: string;
    readonly signatures: {
      id: string;
      publicKey: string;
    };
    readonly type: string;
    readonly provider: any;

    toJSON(): {
      id: string;
      publicKey: string;
      signatures: { id: string; publicKey: string };
      type: string;
    };

    static isIdentity(identity: any): identity is Identity;
    static toJSON(
      identity: Identity,
    ): {
      id: string;
      publicKey: string;
      signatures: { id: string; publicKey: string };
      type: string;
    };
  }

  export interface IdentityProvider {
    getId(options: any): Promise<string>;
    signIdentity(data: any, options: any): Promise<string>;
    static verifyIdentity(identity: Identity): Promise<boolean>;
    static readonly type: string;
    readonly type: string;
  }

  class Identities {
    constructor(options: any);

    readonly keystore: any;
    readonly signingKeystore: any;

    sign(identity: Identity, data: any): Promise<any>;
    verify(
      signature: any,
      publicKey: string,
      data: any,
      verifier?: string,
    ): Promise<boolean>;
    createIdentity(options?: any): Promise<Identity>;
    signId(id: any): Promise<{ publicKey: string; idSignature: any }>;
    verifyIdentity(identity: Identity): Promise<boolean>;

    static verifyIdentity(identity: Identity): Promise<boolean>;
    static createIdentity(options?: {
      id: string;
      migrate?: any;
      keystore?: any;
    }): Promise<Identity>;
    static isSuppoerted(type: string): boolean;
    static addIdentityProvider(identityProvider: IdentityProvider): void;
    static removeIdentityProvider(type: string): void;
    static readonly IdentityProvider: IdentityProvider;
  }

  export default Identities;
}
