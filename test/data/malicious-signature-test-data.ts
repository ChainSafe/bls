/* eslint-disable max-len */

/**
 * Data computed with lower level BLS primitives
 * https://github.com/dapplion/eth2-bls-wasm/blob/2d2f3e6a0487e96706bfd8a1b8039c7d6c79f71f/verifyMultipleSignatures.test.js#L40
 * It creates N valid signatures
 * It messes with the last 2 signatures, modifying their values
 * such that they wqould not fail in aggregate signature verification.
 * Creates a random G2 point with is added to the last signature
 * and substracted to the second to last signature
 */
export const maliciousVerifyMultipleSignaturesData = {
  pks: [
    "b836ccf44fa01e46745ccc3a47855e959783ef5df5cdcc607354b98d52c16b6613761339bfb833fd525cdca7c8071c6b",
    "a317ce36dcf2bf6fd262dbad80427f890bc166152682cb6c600a66eb7d525f200839ab798ca4877c3143a31201905de4",
    "b9b7b4f4a88d98f34b4c9ba8ae10e935ba51164ddc045d6ae26b403c87a6934e6c75f9fb5cc4b3b29a1255b316d08de5",
    "a386a2bc7e9d13cf9b4ad3c819547534c768aeae6a2414bfcebee50f38aaf85a9d610974db931278c08fe86a91eb2999",
  ],
  msgs: [
    "690a91fc0a7a49bbc5afe9516c1831ca8845f281ef2e414f7dfeb71b5e91a902",
    "3829d4fc2332afc2634079823b89598f3674be5da324b1092b3d8aeb7af5e164",
    "9a9406647ed6af16b5ce3e828c5f5ef35f1221ed10476209476c12776ce417ac",
    "3e8e4bcb78fda59a43ebfb90970cc6036ce18dc3d3a1b714cc4c1bfc00b8258e",
  ],
  sigs: [
    "864ed65f224cf4e49e9bbf313d3dc243649885d9bd432a15e6c1259f2e4c29fcefa7a4c3aafaac01519f7c92239702d7096df2971b1801cd26d0ca0d5e7743ccb0abe79d8c383f9bb04ebe553a3094e84d55bc79be7eff5ffdb9b322205acfd1",
    "90efd8c82c356956fc170bec2aed874d14cea079625dfe69d8bc375e10fcd96e2c0348dfeb713f1889629ccb9ec95fee0e0c9cc7a728d8a7068701a04192ed585ec761edf6e2c1e44ceaaa61732052af81a6033fa7d375d7f7157909549322da",
    "9023f43cc8e05a3e842b242b9f6781a9e2eadbfcbebd1242563e56bb47cd273ef20fc0c5099e05e83093581907bfd02915b5ef8c553918d4524c274a8856950c87c6314a2c003a2ed28e5fb56ddfdb233a2b895c2397bd15629325d95ca43b83",
    "82c8fedc6ad43e945bbf7529d55b73d7ce593bc9ea94dfaf91d720b2ab0e51ce551f7fcda96d428b627ff776c94d6f360af425fe7fb4e4469b893071149db747f27a8bd488af7ba7f0edf86c7e551af89d7a55d4fc86968e10f91ed76e68e373",
  ],
  manipulated: [false, false, true, true],
};
