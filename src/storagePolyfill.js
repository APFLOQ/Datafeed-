// Emula la API window.storage (usada por el componente) sobre localStorage,
// para que TradingJournal.jsx funcione igual aquí que en la vista previa de Claude.
if (typeof window !== 'undefined' && !window.storage) {
  const DB_KEY = '__tapeline_kv__';

  const readDb = () => {
    try {
      return JSON.parse(localStorage.getItem(DB_KEY) || '{}');
    } catch {
      return {};
    }
  };
  const writeDb = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));

  window.storage = {
    async get(key) {
      const db = readDb();
      if (!(key in db)) return null;
      return { key, value: db[key], shared: false };
    },
    async set(key, value) {
      const db = readDb();
      db[key] = value;
      writeDb(db);
      return { key, value, shared: false };
    },
    async delete(key) {
      const db = readDb();
      const existed = key in db;
      delete db[key];
      writeDb(db);
      return { key, deleted: existed, shared: false };
    },
    async list(prefix) {
      const db = readDb();
      const keys = Object.keys(db).filter((k) => !prefix || k.startsWith(prefix));
      return { keys, prefix, shared: false };
    },
  };
}
