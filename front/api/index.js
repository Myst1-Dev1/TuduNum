export default async (req, res) => {
  try {
    // Importa o módulo do servidor gerado pelo Angular 19
    const { app } = await import('../dist/front/server/server.mjs');
    
    // Passa a requisição e a resposta para o Express do Angular tratar
    return app(req, res);
  } catch (error) {
    console.error('Erro ao carregar o servidor do Angular:', error);
    res.status(500).send('Erro Interno do Servidor no Vercel');
  }
};