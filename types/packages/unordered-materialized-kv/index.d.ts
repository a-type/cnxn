declare module 'unordered-materialized-kv' {
  type KeyValue = {
    batch: any;
    get: any;
  };

  function umkv(db: any): KeyValue;

  export default umkv;
}
