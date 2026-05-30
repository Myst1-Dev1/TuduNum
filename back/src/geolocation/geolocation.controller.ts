import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';
import { GeocodeRequestDto } from './dto/geocode-request.dto';
import { ReverseGeocodeRequestDto } from './dto/reverse-geocode-request.dto';
import { RouteRequestDto } from './dto/route-request.dto';
import {
  GeocodeResponseDto,
  RouteResponseDto,
} from './dto/geolocation-response.dto';

/**
 * Responsabilidade: camada HTTP do módulo de geolocation.
 *
 * Controller deliberadamente fino: valida input via DTOs, delega ao serviço
 * e transforma output via DTOs de response. Zero lógica de negócio aqui.
 *
 * Prefixo /geo (não /geolocation) para manter URLs concisas no cliente Angular.
 *
 * Autenticação: rotas protegidas por JwtAuthGuard global por padrão.
 * Sem @Public() — o frontend deve enviar token JWT em todas as requisições.
 * Justificativa: geocoding e routing expõem informações de localização do usuário;
 * acesso anônimo seria um risco de privacidade.
 *
 * GET /geo/search  — geocoding por texto
 * GET /geo/reverse — reverse geocoding por coordenadas
 * POST /geo/route  — cálculo de rota entre dois endereços
 *
 * /geo/route usa POST porque o body (origin, destination, mode) é semanticamente
 * um comando de cálculo, não uma query de recurso existente. GET com body
 * é tecnicamente possível mas viola convenções REST e causa problemas em proxies.
 */
@Controller('geo')
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  /**
   * GET /geo/search?address=Avenida+Paulista+São+Paulo
   *
   * Retorna lista de resultados ordenados por confidence (maior primeiro).
   * O frontend pode exibir sugestões ao usuário para seleção.
   */
  @Get('search')
  async search(
    @Query() query: GeocodeRequestDto,
  ): Promise<GeocodeResponseDto[]> {
    const results = await this.geolocationService.geocode(query.address);
    return GeocodeResponseDto.fromDomainList(results);
  }

  /**
   * GET /geo/reverse?lat=-23.5616&lng=-46.6561
   *
   * Retorna o endereço mais próximo das coordenadas fornecidas.
   * Útil para o frontend converter coordenadas do GPS em endereço legível.
   */
  @Get('reverse')
  async reverse(
    @Query() query: ReverseGeocodeRequestDto,
  ): Promise<GeocodeResponseDto> {
    const result = await this.geolocationService.reverseGeocode(
      query.lat,
      query.lng,
    );
    return GeocodeResponseDto.fromDomain(result);
  }

  /**
   * POST /geo/route
   * Body: { "origin": "...", "destination": "...", "mode": "walking" }
   *
   * Retorna distância e tempo estimado. Inclui campos derivados (km, minutos)
   * para facilitar exibição no frontend sem lógica de conversão no cliente.
   */
  @Post('route')
  async route(@Body() dto: RouteRequestDto): Promise<RouteResponseDto> {
    const result = await this.geolocationService.calculateRoute(
      dto.origin,
      dto.destination,
      dto.mode,
    );
    return RouteResponseDto.fromDomain(result);
  }
}
