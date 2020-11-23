import herumi from "bls-eth-wasm";
import { init as initHerumi, destroy, getContext } from "./context";
import { IBls, IPrivateKeyValue, IPublicKeyValue, ISignatureValue } from '../interface';

export async function herumiToIBls(): Promise<IBls> {
    await initHerumi();
    const context: IBls = {
        SecretKey: getContext().SecretKey as IPrivateKeyValue,
        PublicKey: getContext().PublicKey as IPublicKeyValue,
        Signature: getContext().Signature as ISignatureValue,

        toHex: herumi.toHex,
        toHexStr: herumi.toHexStr,
        fromHexStr: herumi.fromHexStr,
        getCurveOrder: herumi.getCurveOrder,
        getFieldOrder: herumi.getFieldOrder,
        verifySignatureOrder: herumi.verifySignatureOrder,
        verifyPublicKeyOrder: herumi.verifyPublicKeyOrder,
        areAllMsgDifferent: herumi.areAllMsgDifferent,
        shouldVerifyBlsSignatureOrder: herumi.shouldVerifyBlsSignatureOrder,
        shouldVerifyBlsPublicKeyOrder: herumi.shouldVerifyBlsPublicKeyOrder,
        deserializeHexStrToSecretKey: herumi.deserializeHexStrToSecretKey as IBls["deserializeHexStrToSecretKey"],
        deserializeHexStrToPublicKey: herumi.deserializeHexStrToPublicKey as IBls["deserializeHexStrToPublicKey"],
        deserializeHexStrToSignature: herumi.deserializeHexStrToSignature as IBls["deserializeHexStrToSignature"],
        init: async () => {
            return context;
        },
        destroy: () => {
            destroy();
        }
    }
    return context;
}