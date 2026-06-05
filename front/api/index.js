module.exports = async (req, res) => {
  try {
    // Importa dinamicamente o bundle ESM do servidor gerado pelo Angular
    const mod = await import('../dist/front/server/server.mjs');

    // O bundle deve exportar um `reqHandler` (criador pelo Angular Node engine)
    const reqHandler = mod.reqHandler || (mod.default && mod.default.reqHandler) || mod.default || mod.app;

    if (typeof reqHandler === 'function') {
      return reqHandler(req, res);
    }

    console.error('reqHandler não encontrado no bundle do servidor. Módulo:', Object.keys(mod));
    res.status(500).send('Handler do servidor não encontrado');
  } catch (error) {
    console.error('Erro ao carregar o servidor do Angular:', error);
    res.status(500).send('Erro Interno do Servidor no Vercel');
  }
};