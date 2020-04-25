export default null;

// // DELETE ME
// import { createClient } from './data/client';

// (async () => {
//   const { node, pieces, user } = await createClient();

//   function getAllPieces() {
//     return pieces.get('');
//   }

//   function getPieceByHash(hash: string) {
//     return pieces.get(hash)[0];
//   }

//   function getPieceByInstrument(instrument: string) {
//     return pieces.query((p) => p.instrument === instrument)[0];
//   }

//   async function updatePieceByHash(hash: string, instrument: string) {
//     const piece = getPieceByHash(hash);
//     piece.instrument = instrument;
//     const cid = await pieces.put(piece);
//     return cid;
//   }

//   async function deletePieceByHash(hash: string) {
//     return pieces.del(hash);
//   }

//   async function addNewPiece(hash: string, instrument = 'Piano') {
//     const existingPiece = getPieceByHash(hash);
//     if (existingPiece) {
//       return updatePieceByHash(hash, instrument);
//     }
//     const cid = await pieces.put({ hash, instrument });
//     return cid;
//   }

//   async function deleteProfileField(key: string) {
//     return user.del(key);
//   }

//   function getAllProfileFields() {
//     return user.all;
//   }

//   function getProfileField(key: string) {
//     return user.get(key);
//   }

//   function updateProfileField(key: string, value: string) {
//     return user.set(key, value);
//   }

//   const cid = await addNewPiece(
//     'QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ',
//   );
//   const content = await node.dag.get(cid);
//   console.log(content.value.payload);

//   const all = getAllPieces();
//   all.forEach((p) => console.log(p));

//   await updateProfileField('username', 'gforrest');
//   console.log(getAllProfileFields());
// })();
