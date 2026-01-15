--
-- PostgreSQL database dump
--

\restrict uh5H7krebgcch62Qhxi68whkVBbv8RQuZr46vIRBfqisYM2E2KO29hJRC2WbxPk

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accessories_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accessories_details (
    id integer NOT NULL,
    product_id character varying NOT NULL,
    product_name character varying NOT NULL,
    category character varying,
    sub_category character varying,
    uom character varying NOT NULL,
    consumable_flag boolean,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.accessories_details OWNER TO postgres;

--
-- Name: accessories_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accessories_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accessories_details_id_seq OWNER TO postgres;

--
-- Name: accessories_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accessories_details_id_seq OWNED BY public.accessories_details.id;


--
-- Name: cm_calculation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cm_calculation (
    id integer NOT NULL,
    cm_id character varying NOT NULL,
    style_id character varying NOT NULL,
    style_material_id character varying,
    total_material_cost double precision,
    average_knitting_minute double precision,
    per_minute_value double precision,
    production_cost double precision,
    overhead_cost double precision,
    testing_cost double precision,
    commercial_cost double precision,
    total_cm double precision,
    amendment_no character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.cm_calculation OWNER TO postgres;

--
-- Name: cm_calculation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cm_calculation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cm_calculation_id_seq OWNER TO postgres;

--
-- Name: cm_calculation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cm_calculation_id_seq OWNED BY public.cm_calculation.id;


--
-- Name: fabric_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fabric_details (
    id integer NOT NULL,
    fabric_id character varying NOT NULL,
    fabric_name character varying NOT NULL,
    category character varying,
    type character varying,
    construction character varying,
    weave_knit character varying,
    gsm integer,
    gauge_epi character varying,
    width character varying,
    stretch character varying,
    shrink character varying,
    finish character varying,
    composition character varying,
    handfeel character varying,
    uom character varying NOT NULL,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.fabric_details OWNER TO postgres;

--
-- Name: fabric_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fabric_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fabric_details_id_seq OWNER TO postgres;

--
-- Name: fabric_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fabric_details_id_seq OWNED BY public.fabric_details.id;


--
-- Name: finished_good_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.finished_good_details (
    id integer NOT NULL,
    product_id character varying NOT NULL,
    product_name character varying NOT NULL,
    category character varying,
    sub_category character varying,
    uom character varying NOT NULL,
    consumable_flag boolean,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.finished_good_details OWNER TO postgres;

--
-- Name: finished_good_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.finished_good_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.finished_good_details_id_seq OWNER TO postgres;

--
-- Name: finished_good_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.finished_good_details_id_seq OWNED BY public.finished_good_details.id;


--
-- Name: packing_good_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.packing_good_details (
    id integer NOT NULL,
    product_id character varying NOT NULL,
    product_name character varying NOT NULL,
    category character varying,
    sub_category character varying,
    uom character varying NOT NULL,
    consumable_flag boolean,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.packing_good_details OWNER TO postgres;

--
-- Name: packing_good_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.packing_good_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.packing_good_details_id_seq OWNER TO postgres;

--
-- Name: packing_good_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.packing_good_details_id_seq OWNED BY public.packing_good_details.id;


--
-- Name: sample_primary_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sample_primary_info (
    id integer NOT NULL,
    sample_id character varying NOT NULL,
    sample_name character varying NOT NULL,
    buyer_id integer NOT NULL,
    buyer_name character varying,
    item character varying,
    gauge character varying,
    ply character varying,
    sample_category character varying,
    yarn_ids json,
    yarn_id character varying,
    yarn_details text,
    component_yarn character varying,
    count character varying,
    trims_ids json,
    trims_details text,
    decorative_part character varying,
    decorative_details text,
    color_id character varying,
    color_name character varying,
    size_id character varying,
    size_name character varying,
    yarn_handover_date timestamp with time zone,
    trims_handover_date timestamp with time zone,
    required_date timestamp with time zone,
    request_pcs integer,
    additional_instruction text,
    techpack_url character varying,
    techpack_filename character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.sample_primary_info OWNER TO postgres;

--
-- Name: sample_primary_info_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sample_primary_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sample_primary_info_id_seq OWNER TO postgres;

--
-- Name: sample_primary_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sample_primary_info_id_seq OWNED BY public.sample_primary_info.id;


--
-- Name: sample_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sample_status (
    id integer NOT NULL,
    sample_id character varying NOT NULL,
    status_by_sample character varying,
    status_from_merchandiser character varying,
    notes text,
    updated_by character varying,
    expecting_end_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.sample_status OWNER TO postgres;

--
-- Name: sample_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sample_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sample_status_id_seq OWNER TO postgres;

--
-- Name: sample_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sample_status_id_seq OWNED BY public.sample_status.id;


--
-- Name: sample_tna_color_wise; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sample_tna_color_wise (
    id integer NOT NULL,
    sample_id character varying NOT NULL,
    sample_name character varying NOT NULL,
    worksheet_received_date timestamp with time zone,
    worksheet_handover_date timestamp with time zone,
    yarn_handover_date timestamp with time zone,
    trims_handover_date timestamp with time zone,
    required_date timestamp with time zone,
    item character varying,
    request_pcs integer,
    sample_category character varying,
    size character varying,
    additional_instruction text,
    techpack_attachment character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.sample_tna_color_wise OWNER TO postgres;

--
-- Name: sample_tna_color_wise_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sample_tna_color_wise_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sample_tna_color_wise_id_seq OWNER TO postgres;

--
-- Name: sample_tna_color_wise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sample_tna_color_wise_id_seq OWNED BY public.sample_tna_color_wise.id;


--
-- Name: size_chart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.size_chart (
    id integer NOT NULL,
    size_id character varying NOT NULL,
    size_name character varying NOT NULL,
    garment_type character varying,
    gender character varying,
    age_group character varying,
    chest double precision,
    waist double precision,
    hip double precision,
    sleeve_length double precision,
    body_length double precision,
    shoulder_width double precision,
    inseam double precision,
    uom character varying NOT NULL,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.size_chart OWNER TO postgres;

--
-- Name: size_chart_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.size_chart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.size_chart_id_seq OWNER TO postgres;

--
-- Name: size_chart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.size_chart_id_seq OWNED BY public.size_chart.id;


--
-- Name: style_basic_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.style_basic_info (
    id integer NOT NULL,
    style_id character varying NOT NULL,
    gauge character varying,
    gender character varying,
    age_group character varying,
    product_type character varying,
    product_category character varying,
    specific_name character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.style_basic_info OWNER TO postgres;

--
-- Name: style_basic_info_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.style_basic_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.style_basic_info_id_seq OWNER TO postgres;

--
-- Name: style_basic_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.style_basic_info_id_seq OWNED BY public.style_basic_info.id;


--
-- Name: style_color; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.style_color (
    id integer NOT NULL,
    style_id character varying NOT NULL,
    color_id character varying NOT NULL,
    color_code_type character varying,
    color_code character varying,
    color_name character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.style_color OWNER TO postgres;

--
-- Name: style_color_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.style_color_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.style_color_id_seq OWNER TO postgres;

--
-- Name: style_color_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.style_color_id_seq OWNED BY public.style_color.id;


--
-- Name: style_creation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.style_creation (
    id integer NOT NULL,
    style_id character varying NOT NULL,
    style_name character varying NOT NULL,
    sample_id character varying NOT NULL,
    buyer_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.style_creation OWNER TO postgres;

--
-- Name: style_creation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.style_creation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.style_creation_id_seq OWNER TO postgres;

--
-- Name: style_creation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.style_creation_id_seq OWNED BY public.style_creation.id;


--
-- Name: style_material_link; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.style_material_link (
    id integer NOT NULL,
    style_material_id character varying NOT NULL,
    style_id character varying NOT NULL,
    material_type character varying NOT NULL,
    material_id character varying NOT NULL,
    required_quantity double precision,
    uom character varying,
    price_per_unit double precision,
    amount double precision,
    amendment_no character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.style_material_link OWNER TO postgres;

--
-- Name: style_material_link_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.style_material_link_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.style_material_link_id_seq OWNER TO postgres;

--
-- Name: style_material_link_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.style_material_link_id_seq OWNED BY public.style_material_link.id;


--
-- Name: style_size; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.style_size (
    id integer NOT NULL,
    style_id character varying NOT NULL,
    size_id character varying NOT NULL,
    size_name character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.style_size OWNER TO postgres;

--
-- Name: style_size_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.style_size_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.style_size_id_seq OWNER TO postgres;

--
-- Name: style_size_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.style_size_id_seq OWNED BY public.style_size.id;


--
-- Name: style_variant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.style_variant (
    id integer NOT NULL,
    style_variant_id character varying NOT NULL,
    style_id character varying NOT NULL,
    color_id character varying NOT NULL,
    size_id character varying NOT NULL,
    color_name character varying,
    size_name character varying,
    variant_name character varying,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.style_variant OWNER TO postgres;

--
-- Name: style_variant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.style_variant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.style_variant_id_seq OWNER TO postgres;

--
-- Name: style_variant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.style_variant_id_seq OWNED BY public.style_variant.id;


--
-- Name: trims_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trims_details (
    id integer NOT NULL,
    product_id character varying NOT NULL,
    product_name character varying NOT NULL,
    category character varying,
    sub_category character varying,
    uom character varying NOT NULL,
    consumable_flag boolean,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.trims_details OWNER TO postgres;

--
-- Name: trims_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trims_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.trims_details_id_seq OWNER TO postgres;

--
-- Name: trims_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trims_details_id_seq OWNED BY public.trims_details.id;


--
-- Name: yarn_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.yarn_details (
    id integer NOT NULL,
    yarn_id character varying NOT NULL,
    yarn_name character varying NOT NULL,
    yarn_composition character varying,
    blend_ratio character varying,
    yarn_count character varying,
    count_system character varying,
    yarn_type character varying,
    yarn_form character varying,
    tpi character varying,
    yarn_finish character varying,
    color character varying,
    dye_type character varying,
    uom character varying NOT NULL,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.yarn_details OWNER TO postgres;

--
-- Name: yarn_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.yarn_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.yarn_details_id_seq OWNER TO postgres;

--
-- Name: yarn_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.yarn_details_id_seq OWNED BY public.yarn_details.id;


--
-- Name: accessories_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accessories_details ALTER COLUMN id SET DEFAULT nextval('public.accessories_details_id_seq'::regclass);


--
-- Name: cm_calculation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cm_calculation ALTER COLUMN id SET DEFAULT nextval('public.cm_calculation_id_seq'::regclass);


--
-- Name: fabric_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fabric_details ALTER COLUMN id SET DEFAULT nextval('public.fabric_details_id_seq'::regclass);


--
-- Name: finished_good_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finished_good_details ALTER COLUMN id SET DEFAULT nextval('public.finished_good_details_id_seq'::regclass);


--
-- Name: packing_good_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packing_good_details ALTER COLUMN id SET DEFAULT nextval('public.packing_good_details_id_seq'::regclass);


--
-- Name: sample_primary_info id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_primary_info ALTER COLUMN id SET DEFAULT nextval('public.sample_primary_info_id_seq'::regclass);


--
-- Name: sample_status id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_status ALTER COLUMN id SET DEFAULT nextval('public.sample_status_id_seq'::regclass);


--
-- Name: sample_tna_color_wise id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_tna_color_wise ALTER COLUMN id SET DEFAULT nextval('public.sample_tna_color_wise_id_seq'::regclass);


--
-- Name: size_chart id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.size_chart ALTER COLUMN id SET DEFAULT nextval('public.size_chart_id_seq'::regclass);


--
-- Name: style_basic_info id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_basic_info ALTER COLUMN id SET DEFAULT nextval('public.style_basic_info_id_seq'::regclass);


--
-- Name: style_color id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_color ALTER COLUMN id SET DEFAULT nextval('public.style_color_id_seq'::regclass);


--
-- Name: style_creation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_creation ALTER COLUMN id SET DEFAULT nextval('public.style_creation_id_seq'::regclass);


--
-- Name: style_material_link id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_material_link ALTER COLUMN id SET DEFAULT nextval('public.style_material_link_id_seq'::regclass);


--
-- Name: style_size id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_size ALTER COLUMN id SET DEFAULT nextval('public.style_size_id_seq'::regclass);


--
-- Name: style_variant id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_variant ALTER COLUMN id SET DEFAULT nextval('public.style_variant_id_seq'::regclass);


--
-- Name: trims_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trims_details ALTER COLUMN id SET DEFAULT nextval('public.trims_details_id_seq'::regclass);


--
-- Name: yarn_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.yarn_details ALTER COLUMN id SET DEFAULT nextval('public.yarn_details_id_seq'::regclass);


--
-- Data for Name: accessories_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accessories_details (id, product_id, product_name, category, sub_category, uom, consumable_flag, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cm_calculation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cm_calculation (id, cm_id, style_id, style_material_id, total_material_cost, average_knitting_minute, per_minute_value, production_cost, overhead_cost, testing_cost, commercial_cost, total_cm, amendment_no, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fabric_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fabric_details (id, fabric_id, fabric_name, category, type, construction, weave_knit, gsm, gauge_epi, width, stretch, shrink, finish, composition, handfeel, uom, remarks, created_at, updated_at) FROM stdin;
1	F001	Cotton Single Jersey	Knitted	Jersey	Plain	Knit	160	12GG	170	25	4	Enzyme	100% Cotton	Soft	kg	T-shirt	2026-01-05 07:08:52.845726+00	\N
2	F002	Wool Rib 1x1	Knitted	Rib	1x1 Rib	Knit	240	7GG	150	35	6	Washed	100% Wool	Bulky	meter	Sweater	2026-01-05 07:08:52.845726+00	\N
3	F003	Interlock Cotton	Knitted	Interlock	Interlock	Knit	200	12GG	160	22	4	Silicone	Cotton	Smooth	kg	Polo	2026-01-05 07:08:52.845726+00	\N
4	F004	French Terry	Fleece	Terry	Loop Back	Knit	260	10GG	170	30	5	Enzyme	Cotton	Soft	meter	Hoodie	2026-01-05 07:08:52.845726+00	\N
5	F005	Polar Fleece	Fleece	Fleece	Brushed	Knit	280	8GG	165	40	4	Anti-pill	Polyester	Warm	kg	Jacket	2026-01-05 07:08:52.845726+00	\N
6	F006	Cotton Twill	Woven	Twill	3/1 Twill	Weave	240	108 EPI	150	5	3	Peached	Cotton	Firm	meter	Chino	2026-01-05 07:08:52.845726+00	\N
7	F007	Cotton Poplin	Woven	Poplin	Plain	Weave	120	120 EPI	150	3	2.5	Calendar	Cotton	Crisp	kg	Shirt	2026-01-05 07:08:52.845726+00	\N
8	F008	Denim Indigo	Denim	Denim	3/1 RHT	Weave	340	72 EPI	150	8	3	Rinse	Cotton	Rigid	meter	Jeans	2026-01-05 07:08:52.845726+00	\N
9	F009	Stretch Denim	Denim	Denim	3/1 Twill	Weave	360	70 EPI	150	20	3	Enzyme	Cotton/Elastane	Stretch	kg	Slim jeans	2026-01-05 07:08:52.845726+00	\N
10	F010	Viscose Challis	Woven	Challis	Plain	Weave	140	110 EPI	145	6	4	Bio Polish	Viscose	Flowing	meter	Dress	2026-01-05 07:08:52.845726+00	\N
11	F011	Polyester Taffeta	Woven	Taffeta	Plain	Weave	90	95 EPI	150	2	1.5	PU Coat	Polyester	Crisp	kg	Lining	2026-01-05 07:08:52.845726+00	\N
12	F012	Non-Woven PP	Non-Woven	Spunbond	Bonded	Non-woven	60	NA	160	1	1	None	Polypropylene	Paper-like	meter	Mask	2026-01-05 07:08:52.845726+00	\N
13	F013	Artificial Leather	Leather	PU Leather	Coated	Coated	420	NA	140	10	2	PU Coated	PU/Poly	Smooth	kg	Bag	2026-01-05 07:08:52.845726+00	\N
14	F014	Lace Fabric	Lace	Lace	Net	Warp Knit	110	28GG	145	15	4	Softener	Nylon	Delicate	meter	Fashion	2026-01-05 07:08:52.845726+00	\N
15	F015	Mesh Fabric	Technical	Mesh	Open Net	Knit	140	24GG	160	35	3	Heat Set	Polyester	Airy	kg	Sports	2026-01-05 07:08:52.845726+00	\N
16	F016	Waterproof Fabric	Technical	Laminated	3-Layer	Woven	180	110 EPI	150	5	2	TPU Lamination	Polyester	Firm	meter	Outdoor	2026-01-05 07:08:52.845726+00	\N
17	F017	Towel Terry	Terry	Terry	Loop Pile	Weave	450	90 EPI	160	6	7	Soft Wash	Cotton	Plush	kg	Towel	2026-01-05 07:08:52.845726+00	\N
18	F018	Velour Knit	Knitted	Velour	Cut Pile	Knit	300	10GG	160	30	5	Brushed	Cotton/Poly	Rich	meter	Tracksuit	2026-01-05 07:08:52.845726+00	\N
19	F019	Ottoman Rib	Knitted	Ottoman	Ribbed	Knit	320	7GG	150	22	5	Silicone	Cotton/Poly	Structured	kg	Fashion	2026-01-05 07:08:52.845726+00	\N
20	F020	Georgette	Woven	Georgette	Crepe	Weave	110	100 EPI	140	8	4	Soft Wash	Polyester	Sheer	meter	Ladies wear	2026-01-05 07:08:52.845726+00	\N
\.


--
-- Data for Name: finished_good_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.finished_good_details (id, product_id, product_name, category, sub_category, uom, consumable_flag, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: packing_good_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.packing_good_details (id, product_id, product_name, category, sub_category, uom, consumable_flag, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sample_primary_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sample_primary_info (id, sample_id, sample_name, buyer_id, buyer_name, item, gauge, ply, sample_category, yarn_ids, yarn_id, yarn_details, component_yarn, count, trims_ids, trims_details, decorative_part, decorative_details, color_id, color_name, size_id, size_name, yarn_handover_date, trims_handover_date, required_date, request_pcs, additional_instruction, techpack_url, techpack_filename, created_at, updated_at) FROM stdin;
1	SMP-20260105-D8BAF7CA	test	1	test	test			Fit	[]					[]								\N	\N	\N	\N				2026-01-05 03:49:19.339899+00	\N
\.


--
-- Data for Name: sample_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sample_status (id, sample_id, status_by_sample, status_from_merchandiser, notes, updated_by, expecting_end_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sample_tna_color_wise; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sample_tna_color_wise (id, sample_id, sample_name, worksheet_received_date, worksheet_handover_date, yarn_handover_date, trims_handover_date, required_date, item, request_pcs, sample_category, size, additional_instruction, techpack_attachment, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: size_chart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.size_chart (id, size_id, size_name, garment_type, gender, age_group, chest, waist, hip, sleeve_length, body_length, shoulder_width, inseam, uom, remarks, created_at, updated_at) FROM stdin;
1	S001	XS	Sweater	Male	Adult	86	78	88	59	65	42	\N	inch	Slim fit	2026-01-05 07:13:16.761537+00	\N
2	S002	S	Sweater	Male	Adult	90	82	92	60	66	43	\N	inch	Regular	2026-01-05 07:13:16.761537+00	\N
3	S003	M	Sweater	Male	Adult	96	88	98	61	68	44	\N	inch	Regular	2026-01-05 07:13:16.761537+00	\N
4	S004	L	Sweater	Male	Adult	102	94	104	62	70	46	\N	inch	Regular	2026-01-05 07:13:16.761537+00	\N
5	S005	XL	Sweater	Male	Adult	108	100	110	63	72	48	\N	inch	Loose fit	2026-01-05 07:13:16.761537+00	\N
6	S006	XS	Sweater	Female	Adult	80	70	84	56	62	38	\N	inch	Slim fit	2026-01-05 07:13:16.761537+00	\N
7	S007	S	Sweater	Female	Adult	84	74	88	57	63	39	\N	inch	Regular	2026-01-05 07:13:16.761537+00	\N
8	S008	M	Sweater	Female	Adult	90	80	94	58	65	40	\N	inch	Regular	2026-01-05 07:13:16.761537+00	\N
9	S009	L	Sweater	Female	Adult	96	86	100	59	67	42	\N	inch	Regular	2026-01-05 07:13:16.761537+00	\N
10	S010	XL	Sweater	Female	Adult	102	92	106	60	69	44	\N	inch	Loose fit	2026-01-05 07:13:16.761537+00	\N
\.


--
-- Data for Name: style_basic_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.style_basic_info (id, style_id, gauge, gender, age_group, product_type, product_category, specific_name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: style_color; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.style_color (id, style_id, color_id, color_code_type, color_code, color_name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: style_creation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.style_creation (id, style_id, style_name, sample_id, buyer_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: style_material_link; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.style_material_link (id, style_material_id, style_id, material_type, material_id, required_quantity, uom, price_per_unit, amount, amendment_no, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: style_size; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.style_size (id, style_id, size_id, size_name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: style_variant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.style_variant (id, style_variant_id, style_id, color_id, size_id, color_name, size_name, variant_name, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: trims_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trims_details (id, product_id, product_name, category, sub_category, uom, consumable_flag, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: yarn_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.yarn_details (id, yarn_id, yarn_name, yarn_composition, blend_ratio, yarn_count, count_system, yarn_type, yarn_form, tpi, yarn_finish, color, dye_type, uom, remarks, created_at, updated_at) FROM stdin;
1		abc											lbs		2026-01-05 03:47:54.177609+00	\N
2	YARN-001	Updated Test Yarn	100% Cotton	\N	25s	\N	\N	\N	\N	\N	\N	\N	kg	\N	2026-01-05 03:54:24.724348+00	2026-01-05 03:54:58.927772+00
4	Y001	Cotton 30/1 Combed	Cotton	100%	30/1	Ne	Combed	Spun	18	Mercerized	White	Yarn Dyed	kg	Smooth handfeel	2026-01-05 07:08:52.800593+00	\N
5	Y002	Cotton 24/1 Carded	Cotton	100%	24/1	Ne	Carded	Spun	16	Raw	Natural	Yarn Dyed	cone	Cost effective	2026-01-05 07:08:52.800593+00	\N
6	Y003	Cotton Slub	Cotton	100%	20/1	Ne	Slub	Spun	15	Raw	Natural	Yarn Dyed	lbs	Fashion slub effect	2026-01-05 07:08:52.800593+00	\N
7	Y004	Wool 2/28 Nm	Wool	100%	2/28	Nm	Carded	Spun	12	Raw	Grey	Yarn Dyed	kg	Winter sweater	2026-01-05 07:08:52.800593+00	\N
8	Y005	Merino Wool	Merino Wool	100%	2/30	Nm	Combed	Spun	14	Superwash	Black	Yarn Dyed	cone	Premium wool	2026-01-05 07:08:52.800593+00	\N
9	Y006	Acrylic 2/32	Acrylic	100%	2/32	Nm	Regular	Spun	13	Raw	Navy	Yarn Dyed	lbs	Budget knit	2026-01-05 07:08:52.800593+00	\N
10	Y007	Wool Acrylic Blend	Wool/Acrylic	50:50:00	2/28	Nm	Carded	Spun	12	Raw	Charcoal	Yarn Dyed	kg	Cost-balanced	2026-01-05 07:08:52.800593+00	\N
11	Y008	Cotton Acrylic	Cotton/Acrylic	60:40:00	24/1	Ne	Combed	Spun	16	Softener	Grey Melange	Melange	cone	Melange look	2026-01-05 07:08:52.800593+00	\N
12	Y009	Viscose Filament	Viscose	100%	150D	Denier	Filament	Filament	0	Bright	Black	Dope Dyed	lbs	Smooth shine	2026-01-05 07:08:52.800593+00	\N
13	Y010	Viscose Nylon	Viscose/Nylon	80:20:00	120D	Denier	Filament	Filament	0	Bright	Navy	Dope Dyed	kg	Stretch knit	2026-01-05 07:08:52.800593+00	\N
14	Y011	Polyester DTY	Polyester	100%	150D	Denier	Textured	Filament	0	Semi Dull	Black	Dope Dyed	cone	Sports knit	2026-01-05 07:08:52.800593+00	\N
15	Y012	Cotton Polyester	Cotton/Polyester	65:35:00	30/1	Ne	Combed	Spun	17	Raw	Heather Grey	Melange	lbs	Easy care	2026-01-05 07:08:52.800593+00	\N
16	Y013	Nylon Stretch	Nylon	100%	70D	Denier	Stretch	Filament	0	Raw	Natural	Dope Dyed	kg	Rib stretch	2026-01-05 07:08:52.800593+00	\N
17	Y014	Cashmere Blend	Cashmere/Wool	11:30	2/26	Nm	Combed	Spun	11	Soft Wash	Camel	Yarn Dyed	cone	Luxury sweater	2026-01-05 07:08:52.800593+00	\N
18	Y015	Bamboo Cotton	Bamboo/Cotton	70:30:00	30/1	Ne	Combed	Spun	18	Bio Polish	Off White	Yarn Dyed	lbs	Eco yarn	2026-01-05 07:08:52.800593+00	\N
19	Y016	Recycled Polyester	rPET	100%	150D	Denier	Textured	Filament	0	Dull	Black	Dope Dyed	kg	Sustainable	2026-01-05 07:08:52.800593+00	\N
20	Y017	Linen Blend	Linen/Cotton	55:45:00	16/1	Ne	Carded	Spun	14	Raw	Natural	Yarn Dyed	cone	Summer knit	2026-01-05 07:08:52.800593+00	\N
21	Y018	Modal Cotton	Modal/Cotton	50:50:00	30/1	Sa	Combed	Spun	18	Softener	White	Yarn Dyed	lbs	Soft drape	2026-01-05 07:08:52.800593+00	\N
22	Y019	Alpaca Blend	Alpaca/Wool	31:10:00	2/24	Nm	Carded	Spun	11	Raw	Brown	Yarn Dyed	lbs	Hairy effect	2026-01-05 07:08:52.800593+00	\N
23	Y020	Cotton Lycra	Cotton/Elastane	95:5	40D	Denier	Core Spun	Spun	20	Raw	White	Yarn Dyed	kg	Stretch rib	2026-01-05 07:08:52.800593+00	\N
\.


--
-- Name: accessories_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accessories_details_id_seq', 1, false);


--
-- Name: cm_calculation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cm_calculation_id_seq', 1, false);


--
-- Name: fabric_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fabric_details_id_seq', 20, true);


--
-- Name: finished_good_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.finished_good_details_id_seq', 1, false);


--
-- Name: packing_good_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.packing_good_details_id_seq', 1, false);


--
-- Name: sample_primary_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sample_primary_info_id_seq', 1, true);


--
-- Name: sample_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sample_status_id_seq', 1, false);


--
-- Name: sample_tna_color_wise_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sample_tna_color_wise_id_seq', 1, false);


--
-- Name: size_chart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.size_chart_id_seq', 10, true);


--
-- Name: style_basic_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.style_basic_info_id_seq', 1, false);


--
-- Name: style_color_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.style_color_id_seq', 1, false);


--
-- Name: style_creation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.style_creation_id_seq', 1, false);


--
-- Name: style_material_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.style_material_link_id_seq', 1, false);


--
-- Name: style_size_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.style_size_id_seq', 1, false);


--
-- Name: style_variant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.style_variant_id_seq', 1, false);


--
-- Name: trims_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trims_details_id_seq', 1, false);


--
-- Name: yarn_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.yarn_details_id_seq', 23, true);


--
-- Name: accessories_details accessories_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accessories_details
    ADD CONSTRAINT accessories_details_pkey PRIMARY KEY (id);


--
-- Name: cm_calculation cm_calculation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cm_calculation
    ADD CONSTRAINT cm_calculation_pkey PRIMARY KEY (id);


--
-- Name: fabric_details fabric_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fabric_details
    ADD CONSTRAINT fabric_details_pkey PRIMARY KEY (id);


--
-- Name: finished_good_details finished_good_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finished_good_details
    ADD CONSTRAINT finished_good_details_pkey PRIMARY KEY (id);


--
-- Name: packing_good_details packing_good_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packing_good_details
    ADD CONSTRAINT packing_good_details_pkey PRIMARY KEY (id);


--
-- Name: sample_primary_info sample_primary_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_primary_info
    ADD CONSTRAINT sample_primary_info_pkey PRIMARY KEY (id);


--
-- Name: sample_status sample_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_status
    ADD CONSTRAINT sample_status_pkey PRIMARY KEY (id);


--
-- Name: sample_tna_color_wise sample_tna_color_wise_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_tna_color_wise
    ADD CONSTRAINT sample_tna_color_wise_pkey PRIMARY KEY (id);


--
-- Name: size_chart size_chart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.size_chart
    ADD CONSTRAINT size_chart_pkey PRIMARY KEY (id);


--
-- Name: style_basic_info style_basic_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_basic_info
    ADD CONSTRAINT style_basic_info_pkey PRIMARY KEY (id);


--
-- Name: style_color style_color_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_color
    ADD CONSTRAINT style_color_pkey PRIMARY KEY (id);


--
-- Name: style_creation style_creation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_creation
    ADD CONSTRAINT style_creation_pkey PRIMARY KEY (id);


--
-- Name: style_material_link style_material_link_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_material_link
    ADD CONSTRAINT style_material_link_pkey PRIMARY KEY (id);


--
-- Name: style_size style_size_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_size
    ADD CONSTRAINT style_size_pkey PRIMARY KEY (id);


--
-- Name: style_variant style_variant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_variant
    ADD CONSTRAINT style_variant_pkey PRIMARY KEY (id);


--
-- Name: trims_details trims_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trims_details
    ADD CONSTRAINT trims_details_pkey PRIMARY KEY (id);


--
-- Name: yarn_details yarn_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.yarn_details
    ADD CONSTRAINT yarn_details_pkey PRIMARY KEY (id);


--
-- Name: ix_accessories_details_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_accessories_details_id ON public.accessories_details USING btree (id);


--
-- Name: ix_accessories_details_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_accessories_details_product_id ON public.accessories_details USING btree (product_id);


--
-- Name: ix_cm_calculation_cm_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_cm_calculation_cm_id ON public.cm_calculation USING btree (cm_id);


--
-- Name: ix_cm_calculation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cm_calculation_id ON public.cm_calculation USING btree (id);


--
-- Name: ix_cm_calculation_style_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cm_calculation_style_id ON public.cm_calculation USING btree (style_id);


--
-- Name: ix_fabric_details_fabric_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_fabric_details_fabric_id ON public.fabric_details USING btree (fabric_id);


--
-- Name: ix_fabric_details_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_fabric_details_id ON public.fabric_details USING btree (id);


--
-- Name: ix_finished_good_details_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_finished_good_details_id ON public.finished_good_details USING btree (id);


--
-- Name: ix_finished_good_details_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_finished_good_details_product_id ON public.finished_good_details USING btree (product_id);


--
-- Name: ix_packing_good_details_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_packing_good_details_id ON public.packing_good_details USING btree (id);


--
-- Name: ix_packing_good_details_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_packing_good_details_product_id ON public.packing_good_details USING btree (product_id);


--
-- Name: ix_sample_primary_info_buyer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_primary_info_buyer_id ON public.sample_primary_info USING btree (buyer_id);


--
-- Name: ix_sample_primary_info_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_primary_info_id ON public.sample_primary_info USING btree (id);


--
-- Name: ix_sample_primary_info_sample_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_sample_primary_info_sample_id ON public.sample_primary_info USING btree (sample_id);


--
-- Name: ix_sample_status_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_status_id ON public.sample_status USING btree (id);


--
-- Name: ix_sample_status_sample_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_status_sample_id ON public.sample_status USING btree (sample_id);


--
-- Name: ix_sample_tna_color_wise_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_tna_color_wise_id ON public.sample_tna_color_wise USING btree (id);


--
-- Name: ix_sample_tna_color_wise_sample_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_tna_color_wise_sample_id ON public.sample_tna_color_wise USING btree (sample_id);


--
-- Name: ix_size_chart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_size_chart_id ON public.size_chart USING btree (id);


--
-- Name: ix_size_chart_size_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_size_chart_size_id ON public.size_chart USING btree (size_id);


--
-- Name: ix_style_basic_info_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_basic_info_id ON public.style_basic_info USING btree (id);


--
-- Name: ix_style_basic_info_style_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_style_basic_info_style_id ON public.style_basic_info USING btree (style_id);


--
-- Name: ix_style_color_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_color_id ON public.style_color USING btree (id);


--
-- Name: ix_style_color_style_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_color_style_id ON public.style_color USING btree (style_id);


--
-- Name: ix_style_creation_buyer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_creation_buyer_id ON public.style_creation USING btree (buyer_id);


--
-- Name: ix_style_creation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_creation_id ON public.style_creation USING btree (id);


--
-- Name: ix_style_creation_sample_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_creation_sample_id ON public.style_creation USING btree (sample_id);


--
-- Name: ix_style_creation_style_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_style_creation_style_id ON public.style_creation USING btree (style_id);


--
-- Name: ix_style_material_link_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_material_link_id ON public.style_material_link USING btree (id);


--
-- Name: ix_style_material_link_style_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_material_link_style_id ON public.style_material_link USING btree (style_id);


--
-- Name: ix_style_material_link_style_material_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_style_material_link_style_material_id ON public.style_material_link USING btree (style_material_id);


--
-- Name: ix_style_size_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_size_id ON public.style_size USING btree (id);


--
-- Name: ix_style_size_style_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_size_style_id ON public.style_size USING btree (style_id);


--
-- Name: ix_style_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_variant_id ON public.style_variant USING btree (id);


--
-- Name: ix_style_variant_style_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_variant_style_id ON public.style_variant USING btree (style_id);


--
-- Name: ix_style_variant_style_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_style_variant_style_variant_id ON public.style_variant USING btree (style_variant_id);


--
-- Name: ix_trims_details_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trims_details_id ON public.trims_details USING btree (id);


--
-- Name: ix_trims_details_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_trims_details_product_id ON public.trims_details USING btree (product_id);


--
-- Name: ix_yarn_details_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_yarn_details_id ON public.yarn_details USING btree (id);


--
-- Name: ix_yarn_details_yarn_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_yarn_details_yarn_id ON public.yarn_details USING btree (yarn_id);


--
-- PostgreSQL database dump complete
--

\unrestrict uh5H7krebgcch62Qhxi68whkVBbv8RQuZr46vIRBfqisYM2E2KO29hJRC2WbxPk

