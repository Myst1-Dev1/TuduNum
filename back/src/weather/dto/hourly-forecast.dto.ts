export class HourlyForecastDto {
  time: string; // Vai formatado ex: "14:00" ou "Agora"
  temperature: number; // Ex: 25
  icon: string; // Código do ícone (ex: "04n") para carregar o SVG correspondente
  description: string; // Um bônus caso queira usar no alt da imagem ou tooltip

  static fromApiResponse(
    item: Record<string, any>,
    index: number,
  ): HourlyForecastDto {
    // Para o primeiro item da lista, podemos forçar o texto "Agora" igual ao seu design
    let formattedTime = '';
    if (index === 0) {
      formattedTime = 'Agora';
    } else {
      const date = new Date(item.dt * 1000);
      // Formata para pegar apenas a hora (HH:mm)
      formattedTime = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return {
      time: formattedTime,
      temperature: item.main?.temp != null ? Math.round(item.main.temp) : 0, // Arredondado sem decimais para o card
      icon: item.weather?.[0]?.icon ?? '',
      description: item.weather?.[0]?.description ?? '',
    };
  }
}
