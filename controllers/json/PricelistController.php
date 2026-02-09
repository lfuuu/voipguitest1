<?php

namespace app\controllers\json;

use app\models\billing_uu\Pricelist;
use app\models\billing_uu\PricelistFilterB;
use app\models\billing_uu\PricelistGroup;
use app\models\billing_uu\PricelistPrefixPrice;
use Yii;
use app\classes\JsonController;
use app\classes\views\PricelistView;
use app\exceptions\FormValidationException;
use app\models\billing_uu\PricelistFilterA;
use app\models\billing_uu\PricelistLocation;
use DateTime;
use yii\base\Exception;
use yii\db\Expression;
use yii\db\IntegrityException;
use yii\db\Query;
use yii\web\ForbiddenHttpException;
use yii\web\HttpException;
use yii\web\Response;
use yii\filters\AccessControl;

class PricelistController extends JsonController
{
    const SEARCH_LIMIT_PER_PRICELIST = 5;
    const DISABLE_TRIGGER = 'disable_trigger';
    const ENABLE_TRIGGER  = 'enable_trigger';

    public function behaviors()
    {
        $behaviors = parent::behaviors();

        // Разрешаем гостевой доступ к агрегату минимальных интернет-цен.
        if (isset($behaviors['access'])) {
            array_unshift($behaviors['access']['rules'], [
                'allow'   => true,
                'actions' => ['group-internet-min-prices', 'get-with-dependents-all'],
                'roles'   => ['?'],
            ]);
        }

        return $behaviors;
    }

    public function actionList()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new ForbiddenHttpException('Access denied');
        }

        return Pricelist::find()
            ->select(['id', 'name', 'service_type_id'])
            ->orderBy('name')
            ->asArray()
            ->all();
    }

    public function actionRead()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $searchArray = $this->request['search_array'];
        $limit  = $this->request['limit'];
        $offset = $this->request['offset'];

        $query = Pricelist::find()
            ->alias('p')
            ->select([
                'p.*',
                'g.name as group_name',
                'is_in_use' => new Expression('sum(case when atl.tariff_id is not null then 1 else 0 end) > 0'),
            ])
            ->leftJoin('billing_uu.pricelist_group g', 'g.id = p.pricelist_group_id')
            ->leftJoin('billing_uu.package_pricelist pp', 'pp.nnp_pricelist_id = p.id')
            ->leftJoin('billing_uu.package_sms sms', 'sms.nnp_pricelist_id = p.id')
            ->leftJoin('billing_uu.package_data data', 'data.nnp_pricelist_id = p.id')
            ->leftJoin(
                'billing_uu.account_tariff_light_view atl',
                'atl.tariff_id = pp.tariff_id or atl.tariff_id = sms.tariff_id or atl.tariff_id = data.tariff_id'
            )
            ->orderBy('name')
            ->groupBy('p.id, g.id')
            ->asArray();

        $countQuery = Pricelist::find()->select(['id'])->distinct();

        if (isset($searchArray['group_id']) && $searchArray['group_id'] && $searchArray['group_id'] != 'all') {
            $query->where(['p.pricelist_group_id' => $searchArray['group_id']]);
            $countQuery->where(['pricelist_group_id' => $searchArray['group_id']]);
        }
        if (isset($searchArray['service_type_id']) && $searchArray['service_type_id']) {
            $query->andWhere(['p.service_type_id' => $searchArray['service_type_id']]);
            $countQuery->andWhere(['service_type_id' => $searchArray['service_type_id']]);
        }
        if (isset($searchArray['currency']) && $searchArray['currency']) {
            $query->andWhere(['p.currency_id' => $searchArray['currency']]);
            $countQuery->andWhere(['currency_id' => $searchArray['currency']]);
        }
        if (isset($searchArray['is_active']) && is_bool($searchArray['is_active'])) {
            $query->andWhere(['p.is_active' => $searchArray['is_active']]);
            $countQuery->andWhere(['is_active' => $searchArray['is_active']]);
        }
        if (isset($searchArray['is_orig']) && is_bool($searchArray['is_orig'])) {
            $query->andWhere(['p.orig' => $searchArray['is_orig']]);
            $countQuery->andWhere(['orig' => $searchArray['is_orig']]);
        }
        if (isset($searchArray['id']) && $searchArray['id']) {
            $query->andWhere(['p.id' => $searchArray['id']]);
            $countQuery->andWhere(['id' => $searchArray['id']]);
        }
        if (isset($searchArray['query']) && $searchArray['query']) {
            $query->andWhere('p.name ilike :name')->addParams([':name' => '%' . $searchArray['query'] . '%']);
            $countQuery->andWhere('name ilike :name')->addParams([':name' => '%' . $searchArray['query'] . '%']);
        }
        if (isset($searchArray['is_in_use']) && is_bool($searchArray['is_in_use'])) {
            if ($searchArray['is_in_use'] == true) {
                $query->having('sum(case when atl.tariff_id is not null then 1 else 0 end) > 0');
            } else {
                $query->having('sum(case when atl.tariff_id is not null then 1 else 0 end) = 0');
            }
        }

        $count = $query->count();
        $query->offset($offset);
        $query->limit($limit);
        $data = $query->all();

        return [
            'totalCount' => $count,
            'data'       => $data,
        ];
    }

    public function actionGetInCommerce()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $id = $this->request['id'];

        $query = Pricelist::find()
            ->alias('p')
            ->select([
                'pricelist_id'       => 'p.id',
                'p_trunk_id'         => 'st.trunk_id',
                'p_trunk_name'       => 't.name',
                'p_trunk_server_id'  => 't.server_id',
                'l_trunk_id'         => 'st.id'
            ])
            ->innerJoin('billing_uu.package_pricelist pp', 'pp.nnp_pricelist_id = p.id')
            ->innerJoin(
                'billing_uu.account_tariff_light atl',
                'atl.tariff_id = pp.tariff_id and atl.service_type_id in (23,24) and now() between atl.activate_from and atl.deactivate_from'
            )
            ->innerJoin('billing.service_trunk st', 'st.id = atl.account_tariff_id')
            ->innerJoin('auth.trunk t', 't.id = st.trunk_id')
            ->where(['p.id' => $id])
            ->orderBy('l_trunk_id')
            ->asArray();

        return $query->all();
    }

    public function actionGetInCommercePackage()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $id = $this->request['id'];

        $query = Pricelist::find()
            ->alias('p')
            ->select([
                'pricelist_type' => 'p.type_id',
                'pricelist_id'   => 'p.id',
                'tariff_id'      => 'pckg.tariff_id',
                'package_name'   => 'pckg.name',
            ])
            ->innerJoin('billing_uu.package_pricelist pp', 'pp.nnp_pricelist_id = p.id')
            ->innerJoin('billing_uu.package pckg', 'pckg.tariff_id = pp.tariff_id and pckg.service_type_id in (3)')
            ->where(['p.id' => $id])
            ->orderBy('tariff_id')
            ->asArray();

        return $query->all();
    }

    public function actionGetInCommercePackageSms()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $id = $this->request['id'];

        $query = Pricelist::find()
            ->alias('p')
            ->select([
                'pricelist_type' => 'p.type_id',
                'pricelist_id'   => 'p.id',
                'tariff_id'      => 'pckg.tariff_id',
                'package_name'   => 'pckg.name',
            ])
            ->innerJoin('billing_uu.package_sms sms', 'sms.nnp_pricelist_id = p.id')
            ->innerJoin('billing_uu.package pckg', 'pckg.tariff_id = sms.tariff_id and pckg.service_type_id in (17,35,36)')
            ->where(['p.id' => $id])
            ->orderBy('tariff_id')
            ->asArray();

        return $query->all();
    }

    public function actionGetInCommercePackageData()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $id = $this->request['id'];

        $query = Pricelist::find()
            ->alias('p')
            ->select([
                'pricelist_type' => 'p.type_id',
                'pricelist_id'   => 'p.id',
                'tariff_id'      => 'pckg.tariff_id',
                'package_name'   => 'pckg.name',
            ])
            ->innerJoin('billing_uu.package_data data', 'data.nnp_pricelist_id = p.id')
            ->innerJoin('billing_uu.package pckg', 'pckg.tariff_id = data.tariff_id and pckg.service_type_id = 31')
            ->where(['p.id' => $id])
            ->orderBy('tariff_id')
            ->asArray();

        return $query->all();
    }

    /**
     * Возвращает минимальные цены на интернет по всем странам в группе прайслистов.
     * По умолчанию берёт только активные прайсы из группы Global1SIM и сервис 3 (Data).
     */
    public function actionGroupInternetMinPrices()
    {
        // Открытый метод: не логируем, иначе для гостя упадёт на user_id NOT NULL.
        $this->doNotLog = true;

        $queryParams = Yii::$app->request->get();

        $groupName     = trim((string)($this->request['groupName'] ?? 'Roaming Data'));
        $serviceTypeId = (int)($this->request['serviceTypeId'] ?? 3);
        $onlyActive    = array_key_exists('onlyActive', $this->request) ? (bool)$this->request['onlyActive'] : false;
        $currency      = $this->request['currency'] ?? ($queryParams['currency'] ?? null);

        if ($currency !== null) {
            $currency = strtoupper(trim((string)$currency));
            if ($currency === '') {
                $currency = null;
            }
        }
        if ($currency === null) {
            $currency = 'RUB';
        }

        if ($groupName === '') {
            throw new HttpException(400, 'Parameter "groupName" is required');
        }

        $group = PricelistGroup::find()
            ->select(['id', 'name'])
            ->where(['name' => $groupName])
            ->asArray()
            ->one();

        if ($group === null) {
            throw new HttpException(404, "Pricelist group '{$groupName}' not found");
        }

        $pricelistQuery = Pricelist::find()
            ->alias('p')
            ->select(['p.id', 'p.name'])
            ->where(['p.pricelist_group_id' => $group['id']]);

        if ($serviceTypeId > 0) {
            $pricelistQuery->andWhere(['p.service_type_id' => $serviceTypeId]);
        }
        if ($onlyActive) {
            $pricelistQuery->andWhere(['p.is_active' => true]);
        }
        if ($currency !== null) {
            $pricelistQuery->andWhere(['p.currency_id' => $currency]);
        }

        $pricelists = $pricelistQuery->asArray()->all();
        if (empty($pricelists)) {
            return [];
        }

        $pricelistIds = array_map('intval', array_column($pricelists, 'id'));

        $baseQuery = (new Query())
            ->select([
                'mcc_value'      => 'mcc_table.mcc',
                'country_name'   => 'mcc_table.country',
                'price'          => new Expression('loc.delta_price::numeric'),
                'pricelist_id'   => 'p.id',
                'pricelist_name' => 'p.name',
                'sim_profile'    => 'loc.sim_profile',
                'row_num'        => new Expression('row_number() OVER (PARTITION BY mcc_table.mcc ORDER BY loc.delta_price::numeric, p.id)'),
            ])
            ->from(['p' => 'billing_uu.pricelist'])
            ->innerJoin(['loc' => 'billing_uu.pricelist_location'], 'loc.pricelist_id = p.id')
            ->join('JOIN LATERAL', 'unnest(loc.mcc) AS mcc_value(mcc)', 'TRUE')
            ->innerJoin(['mcc_table' => 'nnp.mcc'], 'mcc_table.mcc::int = mcc_value.mcc::int')
            ->where(['p.id' => $pricelistIds])
            ->andWhere('loc.delta_price IS NOT NULL');

        $rows = (new Query())
            ->from(['t' => $baseQuery])
            ->where(['row_num' => 1])
            ->orderBy(['mcc_value' => SORT_ASC])
            ->all();

        $simProfileIds = [];
        foreach ($rows as $row) {
            PricelistView::processQueryArray($simProfileIds, $row['sim_profile'] ?? null);
        }
        $simProfileNames = [];
        if (!empty($simProfileIds)) {
            $simProfileIds = array_values(array_unique($simProfileIds));
            $simProfileRows = (new Query())
                ->select(['id', 'name'])
                ->from('billing_uu.sim_imsi_profile')
                ->where(['id' => $simProfileIds])
                ->all();
            foreach ($simProfileRows as $simProfileRow) {
                $simProfileNames[$simProfileRow['id']] = $simProfileRow['name'];
            }
        }

        $result = [];
        foreach ($rows as $row) {
            $mcc = isset($row['mcc_value']) ? str_pad((string)$row['mcc_value'], 3, '0', STR_PAD_LEFT) : '';
            $simProfile = PricelistView::getNameFromDictionary($row['sim_profile'] ?? null, $simProfileNames);

            $result[] = [
                'name'               => $row['country_name'] ?? '',
                'numericCountryCode' => $mcc,
                'minPrices'          => [
                    'internet' => [
                        'price'         => isset($row['price']) ? (float)$row['price'] : null,
                        'priceListId'   => (string)$row['pricelist_id'],
                        'priceListName' => $row['pricelist_name'],
                        'sim_profile'   => $simProfile,
                    ],
                ],
            ];
        }

        return $result;
    }

    /**
     * ВОЗВРАЩАЕТ: плоский массив (через PricelistView) — как в образце.
     * ВСЁ по pl / filterA / filterB без ограничений; префиксы постранично.
     */
    public function actionGetWithDependentsNew1()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new ForbiddenHttpException('Access denied');
        }

        // входные параметры пагинации для префиксов
        $pageLimit   = (int) PricelistPrefixPrice::PAGE_LIMIT;          // размер страницы
        $pageNumber  = max(1, (int)($this->request['prefix_page'] ?? 1));
        $pageOffset  = (int)($this->request['prefix_offset'] ?? (($pageNumber - 1) * $pageLimit));

        // плоские правила (все поля p/pl/pfa/pfb/ppp)
        $flatRules = [
            'p'   => Pricelist::rulesFlat(),
            'pl'  => PricelistLocation::rulesFlat(),
            'pfa' => PricelistFilterA::rulesFlat(),
            'pfb' => PricelistFilterB::rulesFlat(),
            'ppp' => PricelistPrefixPrice::rulesFlat(),
        ];

        $select = [];
        foreach ($flatRules as $tKey => $rules) {
            foreach ($rules as $col) {
                $select[$tKey.'__'.$col] = $tKey.'.'.$col;
            }
        }

        // Счётчики префиксов (без "LATERAL" и без "AS ...", оборачиваем ниже в join)
        $pppCountSql = <<<SQL
SELECT
    COUNT(DISTINCT ppp2.prefix_b)                                                     AS total_prefix_count,
    CEIL(COUNT(DISTINCT ppp2.prefix_b)::numeric / NULLIF(:lim, 0))::int              AS total_pagination_count
FROM billing_uu.pricelist_prefix_price ppp2
WHERE ppp2.pricelist_filter_b_id = pfb.id
  AND ppp2.date_to > now()
SQL;

        // Страница префиксов по каждому filter B
        $pppPageSql = <<<SQL
SELECT
    ppp1.id,
    ppp1.prefix_b,
    ppp1.b_number_price,
    ppp1.b_number_connect_price,
    ppp1.date_from,
    ppp1.date_to,
    ppp1.object_comment,
    ppp1.pricelist_filter_b_id,
    ppp1.change_flag,
    ppp1.history_id
FROM billing_uu.pricelist_prefix_price ppp1
WHERE ppp1.pricelist_filter_b_id = pfb.id
  AND ppp1.date_to > now()
  AND ppp1.prefix_b IN (
      SELECT s.prefix_b
      FROM (
          SELECT DISTINCT pppx.prefix_b
          FROM billing_uu.pricelist_prefix_price pppx
          WHERE pppx.pricelist_filter_b_id = pfb.id
            AND pppx.date_to > now()
          ORDER BY pppx.prefix_b
          LIMIT :lim OFFSET :off
      ) AS s
  )
ORDER BY ppp1.prefix_b, ppp1.id
SQL;

        // подмешиваем счётчики в SELECT
        $select['pfb__total_prefix_count']     = new Expression('COALESCE(ppp_cnt.total_prefix_count, 0)');
        $select['pfb__total_pagination_count'] = new Expression('COALESCE(ppp_cnt.total_pagination_count, 0)');

        $queryResult = Pricelist::find()
            ->alias('p')
            ->select($select)
            ->leftJoin(PricelistLocation::tableName().' pl',  'pl.pricelist_id = p.id')
            ->leftJoin(PricelistFilterA::tableName().' pfa',  'pfa.pricelist_location_id = pl.id')
            ->leftJoin(PricelistFilterB::tableName().' pfb',  'pfb.pricelist_filter_a_id = pfa.id')
            // ВСЕ локации/фильтры — без ограничений
            ->join('LEFT JOIN LATERAL', '(' . $pppCountSql . ') AS ppp_cnt', 'TRUE')
            // страничка префиксов на каждый B
            ->join('LEFT JOIN LATERAL', '(' . $pppPageSql  . ') AS ppp',     'TRUE')
            ->where(['p.id' => $this->request['id']])
            ->orderBy('pl.id, pfa.id, pfb.id, ppp.prefix_b, ppp.id')
            ->addParams([
                ':lim' => $pageLimit,
                ':off' => $pageOffset,
            ])
            ->asArray()
            ->all();

        // сборка плоского ответа: заголовки/строки как в твоём примере
        $result = (isset($this->request['type']) && $this->request['type'] === 'short')
            ? PricelistView::getForShortForm($queryResult)
            : PricelistView::getForFullForm($queryResult);

        return $result;
    }
public function actionGetWithDependentsNew()
{
    if (!\Yii::$app->user->can('pricelist_list')) {
        throw new ForbiddenHttpException('Access denied');
    }

    $T0 = microtime(true);

    $pageLimit   = (int) PricelistPrefixPrice::PAGE_LIMIT;
    $pageNumber  = max(1, (int)($this->request['prefix_page'] ?? 1));
    $pageOffset  = (int)($this->request['prefix_offset'] ?? (($pageNumber - 1) * $pageLimit));

    $flatRules = [
        'p'   => Pricelist::rulesFlat(),
        'pl'  => PricelistLocation::rulesFlat(),
        'pfa' => PricelistFilterA::rulesFlat(),
        'pfb' => PricelistFilterB::rulesFlat(),
        'ppp' => PricelistPrefixPrice::rulesFlat(),
    ];

    $select = [];
    foreach ($flatRules as $tKey => $rules) {
        foreach ($rules as $col) {
            $select[$tKey.'__'.$col] = $tKey.'.'.$col;
        }
    }

    $pppCountSql = <<<SQL
SELECT
    COUNT(DISTINCT ppp2.prefix_b) AS total_prefix_count,
    CEIL(COUNT(DISTINCT ppp2.prefix_b)::numeric / NULLIF(:lim, 0))::int AS total_pagination_count
FROM billing_uu.pricelist_prefix_price ppp2
WHERE ppp2.pricelist_filter_b_id = pfb.id
  AND ppp2.date_to > now()
SQL;

    $pppPageSql = <<<SQL
SELECT
    ppp1.id,
    ppp1.prefix_b,
    ppp1.b_number_price,
    ppp1.b_number_connect_price,
    ppp1.date_from,
    ppp1.date_to,
    ppp1.object_comment,
    ppp1.pricelist_filter_b_id,
    ppp1.change_flag,
    ppp1.history_id
FROM billing_uu.pricelist_prefix_price ppp1
WHERE ppp1.pricelist_filter_b_id = pfb.id
  AND ppp1.date_to > now()
  AND ppp1.prefix_b IN (
      SELECT s.prefix_b
      FROM (
          SELECT DISTINCT pppx.prefix_b
          FROM billing_uu.pricelist_prefix_price pppx
          WHERE pppx.pricelist_filter_b_id = pfb.id
            AND pppx.date_to > now()
          ORDER BY pppx.prefix_b
          LIMIT :lim OFFSET :off
      ) AS s
  )
ORDER BY ppp1.prefix_b, ppp1.id
SQL;

    $select['pfb__total_prefix_count']     = new \yii\db\Expression('COALESCE(ppp_cnt.total_prefix_count, 0)');
    $select['pfb__total_pagination_count'] = new \yii\db\Expression('COALESCE(ppp_cnt.total_pagination_count, 0)');

    $Tsql0 = microtime(true);

    $query = Pricelist::find()
        ->alias('p')
        ->select($select)
        ->leftJoin(PricelistLocation::tableName().' pl',  'pl.pricelist_id = p.id')
        ->leftJoin(PricelistFilterA::tableName().' pfa',  'pfa.pricelist_location_id = pl.id')
        ->leftJoin(PricelistFilterB::tableName().' pfb',  'pfb.pricelist_filter_a_id = pfa.id')
        ->join('LEFT JOIN LATERAL', '(' . $pppCountSql . ') AS ppp_cnt', 'TRUE')
        ->join('LEFT JOIN LATERAL', '(' . $pppPageSql  . ') AS ppp',     'TRUE')
        ->where(['p.id' => $this->request['id']])
        ->orderBy('pl.id, pfa.id, pfb.id, ppp.prefix_b, ppp.id')
        ->addParams([
            ':lim' => $pageLimit,
            ':off' => $pageOffset,
        ])
        ->asArray();

    $queryResult = $query->all();

    $Tsql1 = microtime(true);

    $result = (isset($this->request['type']) && $this->request['type'] === 'short')
        ? PricelistView::getForShortForm($queryResult)
        : PricelistView::getForFullForm($queryResult);

    $Tbuild = microtime(true);

    // --- тайминги в заголовки (чтобы не ломать фронт) ---
    $headers = \Yii::$app->response->headers;
    $headers->set('X-Perf-Sql-ms',   (string) (int) round(($Tsql1 - $Tsql0) * 1000));
    $headers->set('X-Perf-Build-ms', (string) (int) round(($Tbuild - $Tsql1) * 1000));
    $headers->set('X-Perf-Total-ms', (string) (int) round(($Tbuild - $T0) * 1000));
    $headers->set('X-Perf-Page-Limit',  (string) $pageLimit);
    $headers->set('X-Perf-Page-Offset', (string) $pageOffset);
    $headers->set('X-Perf-Page-Number', (string) $pageNumber);
    $headers->set('X-Perf-Rows-Raw',    (string) (is_array($queryResult) ? count($queryResult) : 0));
    $headers->set('X-Perf-Rows-Final',  (string) (is_array($result) ? count($result) : 0));
    $headers->set('X-Perf-Peak-MB',     (string) round(memory_get_peak_usage(true) / 1048576, 1));

    // и в лог на всякий случай
    \Yii::info([
        'sql_ms'   => (int) round(($Tsql1 - $Tsql0) * 1000),
        'build_ms' => (int) round(($Tbuild - $Tsql1) * 1000),
        'total_ms' => (int) round(($Tbuild - $T0) * 1000),
        'limit'    => $pageLimit,
        'offset'   => $pageOffset,
        'page'     => $pageNumber,
        'rows_raw' => is_array($queryResult) ? count($queryResult) : 0,
        'rows_fin' => is_array($result) ? count($result) : 0,
        'peak_mb'  => round(memory_get_peak_usage(true) / 1048576, 1),
    ], 'perf.pricelist');

    // ВОЗВРАЩАЕМ СТАРЫЙ ФОРМАТ, чтобы фронт не падал
    return $result;
}


    /**
     * Вариант «all» — та же логика, что и New: все pl/A/B без лимитов,
     * а префиксы — постранично (limit/offset только для ppp).
     */
    public function actionGetWithDependentsAll()
    {
        // Открытый метод: не логируем, иначе для гостя упадёт на user_id NOT NULL.
        $this->doNotLog = true;

        $pageLimit   = (int) PricelistPrefixPrice::PAGE_LIMIT;
        $pageNumber  = max(1, (int)($this->request['prefix_page'] ?? 1));
        $pageOffset  = (int)($this->request['prefix_offset'] ?? (($pageNumber - 1) * $pageLimit));

        $flatRules = [
            'p'   => Pricelist::rulesFlat(),
            'pl'  => PricelistLocation::rulesFlat(),
            'pfa' => PricelistFilterA::rulesFlat(),
            'pfb' => PricelistFilterB::rulesFlat(),
            'ppp' => PricelistPrefixPrice::rulesFlat(),
        ];

        $select = [];
        foreach ($flatRules as $tKey => $rules) {
            foreach ($rules as $col) {
                $select[$tKey.'__'.$col] = $tKey.'.'.$col;
            }
        }

        $pppCountSql = <<<SQL
SELECT
    COUNT(DISTINCT ppp2.prefix_b)                                                     AS total_prefix_count,
    CEIL(COUNT(DISTINCT ppp2.prefix_b)::numeric / NULLIF(:lim, 0))::int              AS total_pagination_count
FROM billing_uu.pricelist_prefix_price ppp2
WHERE ppp2.pricelist_filter_b_id = pfb.id
  AND ppp2.date_to > now()
SQL;

        $pppPageSql = <<<SQL
SELECT
    ppp1.id,
    ppp1.prefix_b,
    ppp1.b_number_price,
    ppp1.b_number_connect_price,
    ppp1.date_from,
    ppp1.date_to,
    ppp1.object_comment,
    ppp1.pricelist_filter_b_id,
    ppp1.change_flag,
    ppp1.history_id
FROM billing_uu.pricelist_prefix_price ppp1
WHERE ppp1.pricelist_filter_b_id = pfb.id
  AND ppp1.date_to > now()
  AND ppp1.prefix_b IN (
      SELECT s.prefix_b
      FROM (
          SELECT DISTINCT pppx.prefix_b
          FROM billing_uu.pricelist_prefix_price pppx
          WHERE pppx.pricelist_filter_b_id = pfb.id
            AND pppx.date_to > now()
          ORDER BY pppx.prefix_b
          LIMIT :lim OFFSET :off
      ) AS s
  )
ORDER BY ppp1.prefix_b, ppp1.id
SQL;

        $select['pfb__total_prefix_count']     = new Expression('COALESCE(ppp_cnt.total_prefix_count, 0)');
        $select['pfb__total_pagination_count'] = new Expression('COALESCE(ppp_cnt.total_pagination_count, 0)');

        $queryResult = Pricelist::find()
            ->alias('p')
            ->select($select)
            ->leftJoin(PricelistLocation::tableName().' pl',  'pl.pricelist_id = p.id')
            ->leftJoin(PricelistFilterA::tableName().' pfa',  'pfa.pricelist_location_id = pl.id')
            ->leftJoin(PricelistFilterB::tableName().' pfb',  'pfb.pricelist_filter_a_id = pfa.id')
            ->join('LEFT JOIN LATERAL', '(' . $pppCountSql . ') AS ppp_cnt', 'TRUE')
            ->join('LEFT JOIN LATERAL', '(' . $pppPageSql  . ') AS ppp',     'TRUE')
            ->where(['p.id' => $this->request['id']])
            ->orderBy('pl.id, pfa.id, pfb.id, ppp.prefix_b, ppp.id')
            ->addParams([
                ':lim' => $pageLimit,
                ':off' => $pageOffset,
            ])
            ->asArray()
            ->all();

        $result = (isset($this->request['type']) && $this->request['type'] === 'short')
            ? PricelistView::getForShortForm($queryResult)
            : PricelistView::getForFullForm($queryResult);

        return $result;
    }

    public function actionGetWithDependents()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new ForbiddenHttpException('Access denied');
        }

        return Pricelist::find()
            ->with('location.filterA.filterB.prefixPrice')
            ->with('location.filterA.filterB.prefixPriceCount')
            ->where(['id' => $this->request['id']])
            ->asArray()
            ->one();
    }

    public function actionGet()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new ForbiddenHttpException('Access denied');
        }

        return Pricelist::find()
            ->where(['id' => $this->request['id']])
            ->asArray()
            ->one();
    }

    public function actionSave()
    {
        if (!\Yii::$app->user->can('pricelist_edit') && !\Yii::$app->user->can('pricelist_create')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $result = [];

        if (isset($this->request['id'])) {
            if (!\Yii::$app->user->can('pricelist_edit')) {
                throw new ForbiddenHttpException('Access denied');
            }
            $item = $this->getPricelistOr404($this->request['id']);
            $result['log'] = ['data_before' => $this->getDataForLog($item)];
        } else {
            if (!\Yii::$app->user->can('pricelist_create')) {
                throw new ForbiddenHttpException('Access denied');
            }
            $item = Pricelist::create();
            $result['log'] = ['data_before' => []];
        }

        $item->load($this->request, '');

        $transaction = Pricelist::getDb()->beginTransaction();
        try {
            if (!$item->save()) {
                throw new FormValidationException($item);
            }
            $transaction->commit();
        } finally {
            if ($transaction->getIsActive()) {
                $transaction->rollBack();
            }
        }

        if (isset($this->request['old_pricelist_id'])) {
            $item->importFromOldVersion($this->request['old_pricelist_id']);
        }

        $result['log']['data_after'] = $this->getDataForLog($item);

        return $result;
    }

    public function actionSaveAndUpdate()
    {
        if (!\Yii::$app->user->can('pricelist_edit')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $item = $this->getPricelistOr404($this->request['id']);
        $item->load($this->request, '');

        $transaction = Pricelist::getDb()->beginTransaction();
        try {
            if (!$item->save()) {
                throw new FormValidationException($item);
            }

            $filterBArray = PricelistFilterB::find()
                ->alias('fb')
                ->select('fb.*')
                ->innerJoin('billing_uu.pricelist_filter_a as fa', 'fa.id = fb.pricelist_filter_a_id')
                ->innerJoin('billing_uu.pricelist_location as pl', 'pl.id = fa.pricelist_location_id')
                ->with('prefixPriceBasic')
                ->where('pl.pricelist_id = :pricelist_id')
                ->addParams([':pricelist_id' => $this->request['id']])
                ->all();

            foreach ($filterBArray as $filterB) {
                $filterB->tarification_free_seconds      = $item->default_tarification_free_seconds;
                $filterB->tarification_interval_seconds  = $item->default_tarification_interval_seconds;
                $filterB->tarification_min_paid_seconds  = $item->default_tarification_min_paid_seconds;
                $filterB->tarification_type              = $item->default_tarification_type;

                $prefixesToSave     = [];
                $prefixesToSaveFlat = [];

                foreach ($filterB->prefixPriceBasic as $prefixPrice) {
                    if (!isset($prefixesToSave[$prefixPrice->prefix_b])) {
                        $prefixesToSave[$prefixPrice->prefix_b] = ['date_from' => $prefixPrice->date_from, 'id' => $prefixPrice->id];
                    } else {
                        $dateFromCompare = date_create_from_format('Y-m-d', $prefixesToSave[$prefixPrice->prefix_b]['date_from']);
                        $dateFromCurrent = date_create_from_format('Y-m-d', $prefixPrice->date_from);
                        if ($dateFromCurrent > $dateFromCompare) {
                            $prefixesToSave[$prefixPrice->prefix_b] = ['date_from' => $prefixPrice->date_from, 'id' => $prefixPrice->id];
                        }
                    }
                }

                foreach ($prefixesToSave as $prefix) {
                    $prefixesToSaveFlat[] = $prefix['id'];
                }

                foreach ($filterB->prefixPriceBasic as $prefixPrice) {
                    if (in_array($prefixPrice->id, $prefixesToSaveFlat)) {
                        $prefixPrice->date_from = $item->date_start;

                        if (!$prefixPrice->save()) {
                            throw new FormValidationException($item);
                        }
                    } else {
                        $prefixPrice->delete();
                    }
                }

                if (!$filterB->save()) {
                    throw new FormValidationException($item);
                }
            }

            $transaction->commit();
        } finally {
            if ($transaction->getIsActive()) {
                $transaction->rollBack();
            }
        }
    }

    public function actionToggleActive()
    {
        if (!\Yii::$app->user->can('pricelist_edit')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $item = $this->getPricelistOr404($this->request['id']);

        if ($item->isInCommercialUse() && $item->is_active) {
            throw new Exception('In commercial use!');
        } else {
            $item->is_active = !$item->is_active;
            $item->save();
        }
    }

    public function actionInherit()
    {
        if (!\Yii::$app->user->can('pricelist_create')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $name = $this->request['name'];

        if (!empty($name)) {
            $result = (new Query())->select(['id' => new Expression('billing_uu.clone_pricelist(:old_pricelist_id, true, :name)')])
                ->addParams([
                    ':old_pricelist_id' => $this->request['id'],
                    ':name'             => $name
                ])->one();
        } else {
            $result = (new Query())->select(['id' => new Expression('billing_uu.clone_pricelist(:old_pricelist_id, true)')])
                ->addParams([
                    ':old_pricelist_id' => $this->request['id']
                ])->one();
        }

        return $result;
    }

    public function actionCopy()
    {
        if (!\Yii::$app->user->can('pricelist_create')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $result = (new Query())->select(['id' => new Expression('billing_uu.clone_pricelist(:old_pricelist_id)')])
            ->addParams([':old_pricelist_id' => $this->request['id']])
            ->one();

        return $result;
    }

    public function actionUpdatePrefixPrices()
    {
        if (!\Yii::$app->user->can('pricelist_edit')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $today = (new DateTime())->format('Y-m-d');

        if (!preg_match('~^\d{4}-\d{2}-\d{2}$~', $this->request['dateFrom']) || !preg_match('~^\d{4}-\d{2}-\d{2}$~', $this->request['dateTo'])) {
            throw new Exception('Неправильный формат даты');
        }

        $result = (new Query())
            ->select(['id' => new Expression('billing_uu.pricelist_update_prefix_prices(:old_pricelist_id, :multiplier, :new_date_from, :new_date_to, :date_today, :new_type)')])
            ->addParams([
                ':old_pricelist_id' => $this->request['id'],
                ':multiplier'       => $this->request['multiplier'],
                ':new_date_from'    => $this->request['dateFrom'],
                ':new_date_to'      => $this->request['dateTo'],
                ':date_today'       => $today,
                ':new_type'         => $this->request['multiplier'] < 1 ? 'decrease' : 'increase'
            ])
            ->one();

        return $result;
    }

    public function actionCopyAndMultiply()
    {
        if (!\Yii::$app->user->can('pricelist_create')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $result = (new Query())
            ->select(['id' => new Expression('billing_uu.clone_pricelist(:old_pricelist_id, :multiplier)')])
            ->addParams([
                ':old_pricelist_id' => $this->request['id'],
                ':multiplier'       => $this->request['multiplier']
            ])
            ->one();

        return $result;
    }

    public function actionDelete()
    {
        if (!\Yii::$app->user->can('pricelist_delete')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $id   = (int)$this->request['id'];
        $item = $this->getPricelistOr404($id);

        $textError = function (int $status, string $message) {
            $resp = \Yii::$app->response;
            $resp->statusCode = $status;
            $resp->format = Response::FORMAT_RAW;
            $resp->headers->set('Content-Type', 'text/plain; charset=UTF-8');
            $resp->headers->set('X-Error-Message', $message);
            return $message;
        };

        if ((bool)$item->is_active) {
            return $textError(409, "Прайслист #{$id} активен — удаление запрещено");
        }

        $inUse = (new \yii\db\Query())
            ->select(new Expression('1'))
            ->from(['u' =>
                (new \yii\db\Query())
                    ->select('pp.tariff_id')->from('billing_uu.package_pricelist pp')->where(['pp.nnp_pricelist_id' => $id])
                    ->union((new \yii\db\Query())->select('sms.tariff_id')->from('billing_uu.package_sms sms')->where(['sms.nnp_pricelist_id' => $id]))
                    ->union((new \yii\db\Query())->select('data.tariff_id')->from('billing_uu.package_data data')->where(['data.nnp_pricelist_id' => $id]))
            ])
            ->innerJoin('billing_uu.account_tariff_light atl', 'atl.id = u.tariff_id')
            ->where(new Expression('now() BETWEEN atl.activate_from AND atl.deactivate_from'))
            ->limit(1)
            ->scalar() !== false;

        if ($inUse) {
            return $textError(409, "Прайслист #{$id} используется в активных тарифах — удаление запрещено");
        }

        try {
            $deleted = \Yii::$app->db->createCommand(
                'DELETE FROM "billing_uu"."pricelist" WHERE "id" = :id'
            )->bindValue(':id', $id)->execute();

            \Yii::$app->response->format = Response::FORMAT_JSON;
            return [
                'status'       => 'ok',
                'deleted_id'   => $id,
                'deleted_rows' => (int)$deleted,
            ];
        } catch (IntegrityException $e) {
            $tariffIds = (new \yii\db\Query())
                ->select('tariff_id')->distinct(true)
                ->from('billing_uu.package_pricelist')
                ->where(['nnp_pricelist_id' => $id])
                ->column();

            $tail = $tariffIds ? ' Тариф(ы): ' . implode(', ', $tariffIds) : '';
            return $textError(409, "Удаление запрещено: прайслист #{$id} связан с package_pricelist.$tail");
        }
    }

    public function actionSearch()
    {
        if (!\Yii::$app->user->can('pricelist_search')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $fields = [
            'a_country_id','b_country_id','a_region_id','b_region_id','a_city_id','b_city_id','a_operator_id',
            'b_operator_id','a_ndc_id','b_ndc_id','timestamp','number_a','number_b','mcc','mnc','location_id',
            'service_type_id'
        ];

        $apiUrl = 'http://reg10.mcntelecom.ru:8032/';
        $apiParams = ['cmd' => 'findPricelist'];

        foreach ($fields as $fieldName) {
            if (isset($this->request[$fieldName]) && !empty($this->request[$fieldName])) {
                $apiParams[$fieldName] = $this->request[$fieldName];
            }
        }
        if (isset($this->request['is_orig'])) {
            $apiParams['is_orig'] = $this->request['is_orig'];
        }

        $request  = $apiUrl . 'test/nnpcalc?' . http_build_query($apiParams);
        $response = file_get_contents($request);
        $response = json_decode($response, true);

        $result = self::processSearchResult($response['paths']);

        return [
            'params' => $response['params'],
            'paths'  => $result,
            'size'   => $response['size'],
            'url'    => $request
        ];
    }

    private function processSearchResult($data)
    {
        $result = [];
        foreach ($data as $item) {
            $pricelistId = $item['pricelist_id'];

            if (!isset($result[$pricelistId])) {
                $result[$pricelistId] = [];
            }

            if (count($result[$pricelistId]) >= self::SEARCH_LIMIT_PER_PRICELIST) {
                if (!isset($result[$pricelistId]['extra_count'])) {
                    $result[$pricelistId]['extra_count'] = 0;
                }
                $result[$pricelistId]['extra_count']++;
                continue;
            }

            if (count($result[$pricelistId]) == 0) {
                $pricelist = Pricelist::findOne(['id' => $pricelistId]);
                if ($pricelist) {
                    $item['pricelist_name'] = $pricelist->name;
                    $item['date_created']   = $pricelist->date_created;
                    $item['date_start']     = $pricelist->date_start;
                }
                $result[$item['pricelist_id']][] = $item;
            } else {
                unset($item['pricelist_id']);
                $result[$pricelistId][] = $item;
            }
        }
        return $result;
    }

    public function actionOldSearch()
    {
        if (!\Yii::$app->user->can('old_pricelist_search')) {
            throw new ForbiddenHttpException('Access denied');
        }

        $fields = ['country_code', 'prefix', 'pricelist_ids'];

        $apiUrl    = 'http://reg10.mcntelecom.ru:8032/';
        $apiParams = ['cmd' => 'findDefs'];

        foreach ($fields as $fieldName) {
            if (isset($this->request[$fieldName]) && !empty($this->request[$fieldName])) {
                $apiParams[$fieldName] = $this->request[$fieldName];
            }
        }
        if (isset($this->request['exact_match'])) {
            $apiParams['exact_match'] = $this->request['exact_match'];
        }

        $request  = $apiUrl . 'test/nnpcalc?' . http_build_query($apiParams);
        $response = file_get_contents($request);

        return json_decode($response, true);
    }

    public function actionSynchronize()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new ForbiddenHttpException('Access denied');
        }

        \Yii::$app->db->createCommand("select event.notify('nnp_pricelist_prefix_price', 0);")->queryAll();
        return ['success' => 1];
    }

    public function actionIsTriggerEnabled()
    {
        return \Yii::$app->db->createCommand("SELECT nnp.is_trigger_enabled('billing_uu.pricelist_prefix_price','notify')")->queryScalar();
    }

    public function actionSwitchTriggerOn()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new ForbiddenHttpException('Access denied');
        }

        \Yii::$app->db->createCommand("SELECT nnp." . self::ENABLE_TRIGGER . "('billing_uu.pricelist_location','notify')")->execute();
        \Yii::$app->db->createCommand("SELECT nnp." . self::ENABLE_TRIGGER . "('billing_uu.pricelist_filter_a','notify')")->execute();
        \Yii::$app->db->createCommand("SELECT nnp." . self::ENABLE_TRIGGER . "('billing_uu.pricelist_filter_b','notify')")->execute();
        \Yii::$app->db->createCommand("SELECT nnp." . self::ENABLE_TRIGGER . "('billing_uu.pricelist_prefix_price','notify')")->execute();

        return ['success' => 1];
    }

    public function actionSwitchTriggerOff()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new ForbiddenHttpException('Access denied');
        }

        \Yii::$app->db->createCommand("SELECT nnp." . self::DISABLE_TRIGGER . "('billing_uu.pricelist_location','notify')")->execute();
        \Yii::$app->db->createCommand("SELECT nnp." . self::DISABLE_TRIGGER . "('billing_uu.pricelist_filter_a','notify')")->execute();
        \Yii::$app->db->createCommand("SELECT nnp." . self::DISABLE_TRIGGER . "('billing_uu.pricelist_filter_b','notify')")->execute();
        \Yii::$app->db->createCommand("SELECT nnp." . self::DISABLE_TRIGGER . "('billing_uu.pricelist_prefix_price','notify')")->execute();

        return ['success' => 1];
    }

    public function actionNotifyEventToAll()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new ForbiddenHttpException('Access denied');
        }

        \Yii::$app->db->createCommand("select event.notify_event_to_all('nnp_pricelist');")->queryAll();
        \Yii::$app->db->createCommand("select event.notify_event_to_all('nnp_pricelist_location');")->queryAll();
        \Yii::$app->db->createCommand("select event.notify_event_to_all('nnp_pricelist_filter_a');")->queryAll();
        \Yii::$app->db->createCommand("select event.notify_event_to_all('nnp_pricelist_filter_b');")->queryAll();
        \Yii::$app->db->createCommand("select event.notify_event_to_all('nnp_pricelist_prefix_price');")->queryAll();

        return ['success' => 1];
    }

    public function actionRelations()
    {
        if (!\Yii::$app->user->can('pricelist_list')) {
            throw new \yii\web\ForbiddenHttpException('Access denied');
        }

        $id = (int)$this->request['id'];

        $exists = (new Query())->from('billing_uu.pricelist')->where(['id' => $id])->exists();
        if (!$exists) {
            \Yii::$app->response->statusCode = 404;
            \Yii::$app->response->format = Response::FORMAT_JSON;
            return ['message' => "Pricelist #{$id} not found"];
        }

        $voice = (new Query())->select('tariff_id')->distinct()
            ->from('billing_uu.package_pricelist')->where(['nnp_pricelist_id' => $id])->column();

        $sms   = (new Query())->select('tariff_id')->distinct()
            ->from('billing_uu.package_sms')->where(['nnp_pricelist_id' => $id])->column();

        $data  = (new Query())->select('tariff_id')->distinct()
            ->from('billing_uu.package_data')->where(['nnp_pricelist_id' => $id])->column();

        $a2p = (new \yii\db\Query())
            ->select([
                'a2psms_route_table_id',
                new \yii\db\Expression('"order" AS ord'),
                'nnp_pricelist_id'
            ])
            ->from('auth.a2psms_route_table_route')
            ->where(['nnp_pricelist_id' => $id])
            ->orderBy(['a2psms_route_table_id' => SORT_ASC, 'ord' => SORT_ASC])
            ->all();

        \Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return [
            'pricelist_id'      => $id,
            'package_pricelist' => array_values($voice ?: []),
            'package_sms'       => array_values($sms ?: []),
            'package_data'      => array_values($data ?: []),
            'a2p_routes'        => $a2p,
        ];
    }

    protected function getPricelistOr404(int $id): Pricelist
    {
        $item = Pricelist::findOne(['id' => $id]);
        if (!$item) {
            throw new HttpException(404, 'Not found');
        }
        return $item;
    }

    protected function getDataForLog(Pricelist $item): array
    {
        return $item->getAttributes();
    }
}
