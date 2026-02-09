<?php
namespace app\controllers;

use Yii;
use yii\helpers\Url;
use yii\web\Controller;
use yii\web\Response;

class SwaggerController extends Controller
{
    /**
     * Отображает Swagger UI.
     *
     * @return string
     */
    public function actionIndex(): string
{
    $schemaUrl = Url::to(['swagger/json'], 'https'); // <-- всегда HTTPS
    return $this->render('index', ['schemaUrl' => $schemaUrl]);
}
    /**
     * Возвращает OpenAPI спецификацию.
     */
    public function actionJson(): array
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $serverUrl = Url::to('/', 'https');

        return [
            'openapi' => '3.0.3',
            'info' => [
                'title' => 'VoIP GUI API',
                'version' => '1.0.0',
                'description' => 'Документация по JSON API приложения.',
            ],
            'servers' => [
                ['url' => rtrim($serverUrl, '/')],
            ],
            'tags' => [
                ['name' => 'Pricelist', 'description' => 'Операции с прайслистами'],
            ],
            'paths' => [

                // ===== Удаление прайслиста =====
                '/json/pricelist/delete' => [
                    'post' => [
                        'tags' => ['Pricelist'],
                        'summary' => 'Удаление прайслиста',
                        'description' => 'Удаляет прайслист по идентификатору. Требуются права `pricelist_delete`.',
                        'requestBody' => [
                            'required' => true,
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'required' => ['id'],
                                        'properties' => [
                                            'id' => [
                                                'type' => 'integer',
                                                'format' => 'int64',
                                                'description' => 'Идентификатор удаляемого прайслиста',
                                            ],
                                        ],
                                    ],
                                    'example' => ['id' => 123],
                                ],
                            ],
                        ],
                        'responses' => [
                            '200' => [
                                'description' => 'Прайслист успешно удалён. Тело ответа пустое.',
                            ],
                            '403' => [
                                'description' => 'Недостаточно прав для выполнения операции.',
                            ],
                            '404' => [
                                'description' => 'Прайслист с указанным идентификатором не найден.',
                            ],
                            '409' => [
                                'description' => 'Удаление невозможно из-за существующих зависимостей.',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            '$ref' => '#/components/schemas/ErrorResponse',
                                        ],
                                        'example' => [
                                            'errors' => [
                                                [
                                                    'code' => 23503,
                                                    'message' => 'Cannot delete pricelist due to related records.',
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],

                // ===== Новый метод: Полный прайслист без пагинации =====
                '/json/pricelist/get-with-dependents-all' => [
                    'post' => [
                        'tags' => ['Pricelist'],
                        'summary' => 'Полный прайслист без пагинации',
                        'description' => 'Возвращает все данные прайслиста (Location → FilterA → FilterB → PrefixPrice) в виде плоской структуры с алиасами `p__*`, `pl__*`, `pfa__*`, `pfb__*`, `ppp__*`. Поддерживает `type=short|full`. В строках локаций есть поле `continent` (часть света). Доступ открыт (без авторизации).',
                        'requestBody' => [
                            'required' => true,
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'required' => ['id'],
                                        'properties' => [
                                            'id' => [
                                                'type' => 'integer',
                                                'format' => 'int64',
                                                'description' => 'ID прайслиста',
                                            ],
                                            'type' => [
                                                'type' => 'string',
                                                'enum' => ['short', 'full'],
                                                'description' => 'Тип отображения (short или full)',
                                            ],
                                        ],
                                    ],
                                    'example' => ['id' => 12345, 'type' => 'short'],
                                ],
                            ],
                        ],
                        'responses' => [
                            '200' => [
                                'description' => 'Успешный ответ',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'oneOf' => [
                                                ['$ref' => '#/components/schemas/PricelistShortView'],
                                                ['$ref' => '#/components/schemas/PricelistFullView'],
                                            ],
                                        ],
                                        'examples' => [
                                            'short' => [
                                                'summary' => 'Пример short',
                                                'value' => [
                                                    [
                                                        'id' => 12345,
                                                        'name' => 'Retail RU Termination',
                                                        'service_type_id' => 1,
                                                    ],
                                                ],
                                            ],
                                            'full' => [
                                                'summary' => 'Пример full (плоские поля)',
                                                'value' => [
                                                    [
                                                        'p__id' => 12345,
                                                        'p__name' => 'Retail RU Termination',
                                                        'pl__id' => 11,
                                                        'pfa__id' => 22,
                                                        'pfb__id' => 33,
                                                        'ppp__id' => 44,
                                                        'ppp__prefix_b' => '7495',
                                                        'ppp__b_number_price' => '0.050000',
                                                        'ppp__date_from' => '2025-10-01',
                                                        'ppp__date_to' => '3000-01-01',
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            '403' => [
                                'description' => 'Недостаточно прав (нужна роль с `pricelist_list`).',
                            ],
                        ],
                    ],
                ],

                // ===== Минимальные цены на интернет по группе =====
                '/json/pricelist/group-internet-min-prices' => [
                    'post' => [
                        'tags' => ['Pricelist'],
                        'summary' => 'Минимальные цены на интернет по группе прайслистов',
                        'description' => 'Проходит по всем прайслистам в указанной группе (по умолчанию Roaming Data) и возвращает по каждой стране (MCC) минимальную цену на интернет с указанием прайса, где она найдена. Доступ открыт (без проверки прав).',
                        'parameters' => [
                            [
                                'name' => 'currency',
                                'in' => 'query',
                                'required' => false,
                                'schema' => [
                                    'type' => 'string',
                                ],
                                'description' => 'Код валюты ISO 4217 (например, EUR, USD, RUB, HUF). Если не задан — по умолчанию RUB.',
                            ],
                        ],
                        'requestBody' => [
                            'required' => true,
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'groupName' => [
                                                'type' => 'string',
                                                'description' => 'Название группы прайслистов. По умолчанию Roaming Data.',
                                            ],
                                            'currency' => [
                                                'type' => 'string',
                                                'description' => 'Код валюты ISO 4217 (например, EUR, USD, RUB, HUF). Если не задан — по умолчанию RUB.',
                                            ],
                                            'serviceTypeId' => [
                                                'type' => 'integer',
                                                'description' => 'Тип услуги (3 — Data).',
                                                'default' => 3,
                                            ],
                                            'onlyActive' => [
                                                'type' => 'boolean',
                                                'description' => 'Если true — берём только активные прайсы.',
                                                'default' => false,
                                            ],
                                        ],
                                    ],
                                    'example' => [
                                        'groupName' => 'Roaming Data',
                                        'currency' => 'EUR',
                                        'serviceTypeId' => 3,
                                        'onlyActive' => false,
                                    ],
                                ],
                            ],
                        ],
                        'responses' => [
                            '200' => [
                                'description' => 'Список стран с минимальными ценами на интернет по группе.',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'array',
                                            'items' => [
                                                '$ref' => '#/components/schemas/InternetGroupPriceItem',
                                            ],
                                        ],
                                        'example' => [
                                            [
                                                'name' => 'Russia',
                                                'numericCountryCode' => '250',
                                                'minPrices' => [
                                                    'internet' => [
                                                        'price' => 0.02,
                                                        'priceListId' => '2354',
                                                        'priceListName' => 'S6',
                                                        'sim_profile' => 'Profile A, Profile B',
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            '400' => [
                                'description' => 'Некорректный запрос (например, пустое имя группы).',
                            ],
                            '404' => [
                                'description' => 'Группа прайслистов не найдена.',
                            ],
                        ],
                    ],
                ],
            ],

            // ===== Компоненты (схемы) =====
            'components' => [
                'schemas' => [

                    // Ошибки
                    'ErrorResponse' => [
                        'type' => 'object',
                        'properties' => [
                            'errors' => [
                                'type' => 'array',
                                'items' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'code' => [
                                            'type' => 'integer',
                                            'format' => 'int64',
                                        ],
                                        'message' => [
                                            'type' => 'string',
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],

                    // Ответ с минимальными ценами на интернет по стране
                    'InternetGroupPriceItem' => [
                        'type' => 'object',
                        'properties' => [
                            'name' => [
                                'type' => 'string',
                                'description' => 'Название страны из справочника MCC.',
                            ],
                            'numericCountryCode' => [
                                'type' => 'string',
                                'description' => 'MCC (3 цифры) из прайслиста, например 250.',
                            ],
                            'minPrices' => [
                                'type' => 'object',
                                'properties' => [
                                    'internet' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'price' => ['type' => 'number', 'format' => 'float'],
                                            'priceListId' => ['type' => 'string'],
                                            'priceListName' => ['type' => 'string'],
                                            'sim_profile' => [
                                                'type' => 'string',
                                                'description' => 'Sim-профиль, соответствующий минимальной цене.',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],

                    // Краткий формат прайслиста
                    'PricelistShortView' => [
                        'type' => 'array',
                        'description' => 'Результат работы PricelistView::getForShortForm()',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'continent' => [
                                    'type' => 'string',
                                    'description' => 'Часть света из справочника MCC (для строк локаций).',
                                ],
                            ],
                            'additionalProperties' => true,
                        ],
                    ],

                    // Полный формат прайслиста (плоский)
                    'PricelistFullView' => [
                        'type' => 'array',
                        'description' => 'Плоская структура с алиасами p__/pl__/pfa__/pfb__/ppp__',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'p__id' => ['type' => 'integer', 'format' => 'int64'],
                                'p__name' => ['type' => 'string'],
                                'ppp__prefix_b' => ['type' => 'string'],
                                'ppp__b_number_price' => ['type' => 'string'],
                                'continent' => [
                                    'type' => 'string',
                                    'description' => 'Часть света из справочника MCC (для строк локаций).',
                                ],
                            ],
                            'additionalProperties' => true,
                        ],
                    ],
                ],
            ],
        ];
    }
}
