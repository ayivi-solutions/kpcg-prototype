import type {Geography,Indicator,Observation} from './contracts';
import type {IngestionAdapter,IngestionContext,RawSourceRecord} from './ingestion';

export type ClimateSourceId='kmd'|'ndma'|'knbs'|'health'|'mfl'|'nema'|'county'|'kpcg'|'who'|'wmo'|'unfccc'|'fao'|'unep'|'world-bank'|'earth-observation'|'approved-national';
export interface SourceAdapterSpec{
  id:ClimateSourceId;
  authority:string;
  jurisdiction:'Kenya'|'International';
  priority:1|2;
  domains:string[];
  aggregateOnly?:boolean;
  classificationRule?:string;
  activationRequirements:string[];
}
export interface SourceReader{read(spec:SourceAdapterSpec):Promise<RawSourceRecord[]>}
export interface AdapterHooks{
  validate(record:RawSourceRecord,spec:SourceAdapterSpec):Promise<void>|void;
  geography(record:RawSourceRecord,context:IngestionContext,spec:SourceAdapterSpec):Promise<string>|string;
  units(record:RawSourceRecord,spec:SourceAdapterSpec):Promise<{value:number|string|null;unit:string}>|{value:number|string|null;unit:string};
  indicator(record:RawSourceRecord,context:IngestionContext,spec:SourceAdapterSpec):Promise<string>|string;
  provenance(record:RawSourceRecord,spec:SourceAdapterSpec):Promise<Record<string,unknown>>|Record<string,unknown>;
  observation(record:RawSourceRecord,context:IngestionContext,spec:SourceAdapterSpec):Promise<Observation>;
  rawReference(record:RawSourceRecord,spec:SourceAdapterSpec):Promise<string|null>|string|null;
  failure(error:unknown,record:RawSourceRecord|undefined,spec:SourceAdapterSpec):Promise<void>|void;
}

const commonRequirements=['confirmed access route','licence/terms reviewed','source schema documented','refresh cadence recorded','geography crosswalk validated','unit validation rules approved','provenance retained'];
export const SOURCE_ADAPTER_SPECS:Readonly<Record<ClimateSourceId,SourceAdapterSpec>>=Object.freeze({
  kmd:{id:'kmd',authority:'Kenya Meteorological Department',jurisdiction:'Kenya',priority:1,domains:['temperature','rainfall','anomalies','seasonal climate','heat','outlooks','projections'],activationRequirements:commonRequirements},
  ndma:{id:'ndma',authority:'National Drought Management Authority',jurisdiction:'Kenya',priority:1,domains:['drought phase','vegetation','water stress','food security','livelihood early warning'],classificationRule:'Use NDMA published drought classifications verbatim; do not derive a KPCG replacement classification.',activationRequirements:commonRequirements},
  knbs:{id:'knbs',authority:'Kenya National Bureau of Statistics',jurisdiction:'Kenya',priority:1,domains:['population','demographics','poverty','socio-economic vulnerability','census geography'],activationRequirements:commonRequirements},
  health:{id:'health',authority:'Kenya Ministry of Health / KHIS',jurisdiction:'Kenya',priority:1,domains:['malaria','diarrhoeal disease','climate-sensitive disease','malnutrition','health services'],aggregateOnly:true,activationRequirements:[...commonRequirements,'privacy/disclosure-control review completed']},
  mfl:{id:'mfl',authority:'Kenya Master Health Facility List / Registry',jurisdiction:'Kenya',priority:1,domains:['facility locations','facility types','facility capacity','facility climate exposure'],activationRequirements:commonRequirements},
  nema:{id:'nema',authority:'National Environment Management Authority',jurisdiction:'Kenya',priority:1,domains:['air quality','environmental indicators','emissions'],activationRequirements:commonRequirements},
  county:{id:'county',authority:'Kenya County Governments / approved county plans',jurisdiction:'Kenya',priority:1,domains:['county climate plans','budgets','preparedness','resilience','institutional readiness'],activationRequirements:commonRequirements},
  kpcg:{id:'kpcg',authority:'Kenya Platform for Climate Governance',jurisdiction:'Kenya',priority:1,domains:['programmes','projects','members','evidence','policy','events','advocacy'],activationRequirements:['canonical KPCG content IDs','county relationships validated','publication status respected']},
  who:{id:'who',authority:'World Health Organization',jurisdiction:'International',priority:2,domains:['climate and health','disease','health-system resilience'],activationRequirements:commonRequirements},
  wmo:{id:'wmo',authority:'World Meteorological Organization',jurisdiction:'International',priority:2,domains:['climate','weather','extremes'],activationRequirements:commonRequirements},
  unfccc:{id:'unfccc',authority:'UN Framework Convention on Climate Change',jurisdiction:'International',priority:2,domains:['NDC','Paris Agreement','mitigation','adaptation'],activationRequirements:commonRequirements},
  fao:{id:'fao',authority:'Food and Agriculture Organization',jurisdiction:'International',priority:2,domains:['agriculture','food security','ecosystems'],activationRequirements:commonRequirements},
  unep:{id:'unep',authority:'United Nations Environment Programme',jurisdiction:'International',priority:2,domains:['environment','adaptation','pollution','ecosystems'],activationRequirements:commonRequirements},
  'world-bank':{id:'world-bank',authority:'World Bank',jurisdiction:'International',priority:2,domains:['development','exposure','vulnerability','climate finance'],activationRequirements:commonRequirements},
  'earth-observation':{id:'earth-observation',authority:'Approved Earth-observation programme',jurisdiction:'International',priority:2,domains:['vegetation','flood','forest','land','coastal','continuous surfaces'],activationRequirements:[...commonRequirements,'spatial resolution and uncertainty documented']},
  'approved-national':{id:'approved-national',authority:'Approved authoritative Kenya national source',jurisdiction:'Kenya',priority:1,domains:['energy','clean cooking','mitigation'],activationRequirements:commonRequirements}
});

export class ConfiguredSourceAdapter implements IngestionAdapter{
  readonly sourceId:string;
  constructor(readonly spec:SourceAdapterSpec,private readonly reader:SourceReader,private readonly hooks:AdapterHooks){this.sourceId=spec.id}
  fetchOrRead(){return this.reader.read(this.spec)}
  validate(record:RawSourceRecord){return this.hooks.validate(record,this.spec)}
  normalizeGeography(record:RawSourceRecord,context:IngestionContext){return this.hooks.geography(record,context,this.spec)}
  normalizeUnits(record:RawSourceRecord){return this.hooks.units(record,this.spec)}
  mapIndicator(record:RawSourceRecord,context:IngestionContext){return this.hooks.indicator(record,context,this.spec)}
  attachProvenance(record:RawSourceRecord){return this.hooks.provenance(record,this.spec)}
  toObservation(record:RawSourceRecord,context:IngestionContext){return this.hooks.observation(record,context,this.spec)}
  preserveRawReference(record:RawSourceRecord){return this.hooks.rawReference(record,this.spec)}
  reportFailure(error:unknown,record?:RawSourceRecord){return this.hooks.failure(error,record,this.spec)}
}

export function createSourceAdapter(sourceId:ClimateSourceId,reader:SourceReader,hooks:AdapterHooks):IngestionAdapter{
  const spec=SOURCE_ADAPTER_SPECS[sourceId];
  if(!spec)throw new Error(`Unknown climate source adapter: ${sourceId}`);
  return new ConfiguredSourceAdapter(spec,reader,hooks);
}

export function assertCanonicalGeography(id:string,geographies:Map<string,Geography>):Geography{
  const geography=geographies.get(id);
  if(!geography)throw new Error(`Observation geography is not canonical: ${id}`);
  return geography;
}
export function assertKnownIndicator(id:string,indicators:Map<string,Indicator>):Indicator{
  const indicator=indicators.get(id);
  if(!indicator)throw new Error(`Observation indicator is not registered: ${id}`);
  return indicator;
}

/** Deliberately fails closed until a source-specific reader and normalizers are configured. */
export function pendingReader(sourceId:ClimateSourceId):SourceReader{
  return{async read(){throw new Error(`${sourceId} adapter is structurally registered but not activated: configure access, licence, schema, refresh cadence and validation before ingestion.`)}};
}
