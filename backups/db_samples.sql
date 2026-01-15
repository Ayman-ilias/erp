--
-- PostgreSQL database dump
--

\restrict cNolWkDj3TFpTIvbpwQJ6LSsL1VfbukYuh3nZPK6dgdPwYt5HRrRzZBSnEswjT7

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
-- Name: garment_colors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.garment_colors (
    id integer NOT NULL,
    color_name character varying NOT NULL,
    color_code character varying NOT NULL,
    color_ref character varying,
    category character varying,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.garment_colors OWNER TO postgres;

--
-- Name: garment_colors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.garment_colors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.garment_colors_id_seq OWNER TO postgres;

--
-- Name: garment_colors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.garment_colors_id_seq OWNED BY public.garment_colors.id;


--
-- Name: garment_sizes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.garment_sizes (
    id integer NOT NULL,
    size_value character varying NOT NULL,
    size_label character varying,
    size_category character varying,
    sort_order integer,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.garment_sizes OWNER TO postgres;

--
-- Name: garment_sizes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.garment_sizes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.garment_sizes_id_seq OWNER TO postgres;

--
-- Name: garment_sizes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.garment_sizes_id_seq OWNED BY public.garment_sizes.id;


--
-- Name: manufacturing_operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.manufacturing_operations (
    id integer NOT NULL,
    operation_id character varying NOT NULL,
    operation_type character varying NOT NULL,
    operation_name character varying NOT NULL,
    standard_duration double precision,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.manufacturing_operations OWNER TO postgres;

--
-- Name: manufacturing_operations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.manufacturing_operations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.manufacturing_operations_id_seq OWNER TO postgres;

--
-- Name: manufacturing_operations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.manufacturing_operations_id_seq OWNED BY public.manufacturing_operations.id;


--
-- Name: material_master; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_master (
    id integer NOT NULL,
    material_name character varying NOT NULL,
    uom character varying NOT NULL,
    material_category character varying,
    description character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.material_master OWNER TO postgres;

--
-- Name: material_master_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.material_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.material_master_id_seq OWNER TO postgres;

--
-- Name: material_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.material_master_id_seq OWNED BY public.material_master.id;


--
-- Name: operation_master; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operation_master (
    operation_id integer NOT NULL,
    operation_name character varying NOT NULL,
    machine_type character varying,
    skill_level character varying,
    standard_time double precision,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.operation_master OWNER TO postgres;

--
-- Name: operation_master_operation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operation_master_operation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.operation_master_operation_id_seq OWNER TO postgres;

--
-- Name: operation_master_operation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operation_master_operation_id_seq OWNED BY public.operation_master.operation_id;


--
-- Name: operation_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operation_types (
    id integer NOT NULL,
    operation_type character varying NOT NULL,
    operation_name character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.operation_types OWNER TO postgres;

--
-- Name: operation_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operation_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.operation_types_id_seq OWNER TO postgres;

--
-- Name: operation_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operation_types_id_seq OWNED BY public.operation_types.id;


--
-- Name: required_materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.required_materials (
    id integer NOT NULL,
    style_variant_id integer,
    style_name character varying,
    style_id character varying,
    material character varying,
    uom character varying,
    consumption_per_piece double precision,
    converted_uom character varying,
    converted_consumption double precision,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.required_materials OWNER TO postgres;

--
-- Name: required_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.required_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.required_materials_id_seq OWNER TO postgres;

--
-- Name: required_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.required_materials_id_seq OWNED BY public.required_materials.id;


--
-- Name: sample_machines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sample_machines (
    id integer NOT NULL,
    machine_code character varying NOT NULL,
    machine_name character varying NOT NULL,
    machine_type character varying,
    gauge_capability character varying,
    brand character varying,
    location character varying,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.sample_machines OWNER TO postgres;

--
-- Name: sample_machines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sample_machines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sample_machines_id_seq OWNER TO postgres;

--
-- Name: sample_machines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sample_machines_id_seq OWNED BY public.sample_machines.id;


--
-- Name: sample_operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sample_operations (
    id integer NOT NULL,
    sample_request_id integer NOT NULL,
    operation_master_id integer NOT NULL,
    operation_type character varying,
    operation_name character varying,
    sequence_order integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.sample_operations OWNER TO postgres;

--
-- Name: sample_operations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sample_operations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sample_operations_id_seq OWNER TO postgres;

--
-- Name: sample_operations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sample_operations_id_seq OWNED BY public.sample_operations.id;


--
-- Name: sample_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sample_plans (
    id integer NOT NULL,
    sample_request_id integer NOT NULL,
    assigned_designer character varying,
    assigned_programmer character varying,
    assigned_supervisor_knitting character varying,
    assigned_supervisor_finishing character varying,
    required_knitting_machine_id integer,
    delivery_plan_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.sample_plans OWNER TO postgres;

--
-- Name: sample_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sample_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sample_plans_id_seq OWNER TO postgres;

--
-- Name: sample_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sample_plans_id_seq OWNED BY public.sample_plans.id;


--
-- Name: sample_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sample_requests (
    id integer NOT NULL,
    sample_id character varying NOT NULL,
    buyer_id integer NOT NULL,
    buyer_name character varying,
    sample_name character varying NOT NULL,
    style_id integer,
    gauge character varying,
    ply integer,
    item character varying,
    yarn_id character varying,
    yarn_details json,
    trims_ids json,
    trims_details json,
    decorative_part character varying,
    decorative_details text,
    yarn_handover_date timestamp with time zone,
    trims_handover_date timestamp with time zone,
    required_date timestamp with time zone,
    request_pcs integer,
    sample_category character varying,
    color_name character varying,
    size_name character varying,
    additional_instruction text,
    techpack_url character varying,
    techpack_filename character varying,
    round integer,
    current_status character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.sample_requests OWNER TO postgres;

--
-- Name: sample_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sample_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sample_requests_id_seq OWNER TO postgres;

--
-- Name: sample_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sample_requests_id_seq OWNED BY public.sample_requests.id;


--
-- Name: sample_required_materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sample_required_materials (
    id integer NOT NULL,
    sample_request_id integer NOT NULL,
    product_category character varying,
    product_id character varying,
    product_name character varying,
    category character varying,
    sub_category character varying,
    required_quantity double precision NOT NULL,
    uom character varying NOT NULL,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.sample_required_materials OWNER TO postgres;

--
-- Name: sample_required_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sample_required_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sample_required_materials_id_seq OWNER TO postgres;

--
-- Name: sample_required_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sample_required_materials_id_seq OWNED BY public.sample_required_materials.id;


--
-- Name: sample_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sample_status (
    id integer NOT NULL,
    sample_request_id integer NOT NULL,
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
-- Name: sample_tna; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sample_tna (
    id integer NOT NULL,
    sample_request_id integer NOT NULL,
    operation_sequence integer NOT NULL,
    operation_name character varying NOT NULL,
    responsible_person character varying,
    start_datetime timestamp with time zone,
    end_datetime timestamp with time zone,
    actual_start_datetime timestamp with time zone,
    actual_end_datetime timestamp with time zone,
    status character varying,
    remark text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.sample_tna OWNER TO postgres;

--
-- Name: sample_tna_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sample_tna_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sample_tna_id_seq OWNER TO postgres;

--
-- Name: sample_tna_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sample_tna_id_seq OWNED BY public.sample_tna.id;


--
-- Name: samples; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.samples (
    id integer NOT NULL,
    sample_id character varying NOT NULL,
    buyer_id integer NOT NULL,
    style_id integer,
    sample_type character varying,
    sample_description text,
    item character varying,
    gauge character varying,
    worksheet_rcv_date timestamp with time zone,
    yarn_rcv_date timestamp with time zone,
    required_date timestamp with time zone,
    color character varying,
    assigned_designer character varying,
    required_sample_quantity integer,
    round integer,
    notes text,
    submit_status character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.samples OWNER TO postgres;

--
-- Name: samples_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.samples_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.samples_id_seq OWNER TO postgres;

--
-- Name: samples_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.samples_id_seq OWNED BY public.samples.id;


--
-- Name: smv_calculations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.smv_calculations (
    id integer NOT NULL,
    style_variant_id integer NOT NULL,
    operation_id integer,
    operation_type character varying,
    operation_name character varying,
    number_of_operations integer,
    duration_hms character varying,
    total_duration_minutes double precision,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.smv_calculations OWNER TO postgres;

--
-- Name: smv_calculations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.smv_calculations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.smv_calculations_id_seq OWNER TO postgres;

--
-- Name: smv_calculations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.smv_calculations_id_seq OWNED BY public.smv_calculations.id;


--
-- Name: smv_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.smv_settings (
    setting_id integer NOT NULL,
    style_type character varying NOT NULL,
    approval_factor double precision NOT NULL,
    allowance_percent double precision NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.smv_settings OWNER TO postgres;

--
-- Name: smv_settings_setting_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.smv_settings_setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.smv_settings_setting_id_seq OWNER TO postgres;

--
-- Name: smv_settings_setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.smv_settings_setting_id_seq OWNED BY public.smv_settings.setting_id;


--
-- Name: style_operation_breakdown; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.style_operation_breakdown (
    style_op_id integer NOT NULL,
    style_variant_id integer NOT NULL,
    operation_id integer NOT NULL,
    machine_time double precision,
    manual_time double precision,
    finishing_time double precision,
    total_basic_time double precision,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.style_operation_breakdown OWNER TO postgres;

--
-- Name: style_operation_breakdown_style_op_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.style_operation_breakdown_style_op_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.style_operation_breakdown_style_op_id_seq OWNER TO postgres;

--
-- Name: style_operation_breakdown_style_op_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.style_operation_breakdown_style_op_id_seq OWNED BY public.style_operation_breakdown.style_op_id;


--
-- Name: style_smv; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.style_smv (
    smv_id integer NOT NULL,
    style_variant_id integer NOT NULL,
    total_basic_time double precision NOT NULL,
    total_smart_smv double precision NOT NULL,
    approval_factor double precision NOT NULL,
    created_date timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.style_smv OWNER TO postgres;

--
-- Name: style_smv_smv_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.style_smv_smv_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.style_smv_smv_id_seq OWNER TO postgres;

--
-- Name: style_smv_smv_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.style_smv_smv_id_seq OWNED BY public.style_smv.smv_id;


--
-- Name: style_summaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.style_summaries (
    id integer NOT NULL,
    buyer_id integer NOT NULL,
    style_name character varying NOT NULL,
    style_id character varying NOT NULL,
    product_category character varying,
    product_type character varying,
    customs_customer_group character varying,
    type_of_construction character varying,
    gauge character varying,
    style_description text,
    is_set boolean,
    set_piece_count integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.style_summaries OWNER TO postgres;

--
-- Name: style_summaries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.style_summaries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.style_summaries_id_seq OWNER TO postgres;

--
-- Name: style_summaries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.style_summaries_id_seq OWNED BY public.style_summaries.id;


--
-- Name: style_variant_colors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.style_variant_colors (
    id integer NOT NULL,
    style_variant_id integer NOT NULL,
    part_name character varying NOT NULL,
    colour_name character varying NOT NULL,
    colour_code character varying,
    colour_ref character varying,
    sort_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.style_variant_colors OWNER TO postgres;

--
-- Name: style_variant_colors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.style_variant_colors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.style_variant_colors_id_seq OWNER TO postgres;

--
-- Name: style_variant_colors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.style_variant_colors_id_seq OWNED BY public.style_variant_colors.id;


--
-- Name: style_variant_materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.style_variant_materials (
    id integer NOT NULL,
    style_variant_id integer NOT NULL,
    style_material_id character varying,
    product_category character varying,
    sub_category character varying,
    product_id character varying,
    product_name character varying,
    required_quantity double precision,
    uom character varying,
    weight double precision,
    weight_uom character varying,
    condition text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.style_variant_materials OWNER TO postgres;

--
-- Name: style_variant_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.style_variant_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.style_variant_materials_id_seq OWNER TO postgres;

--
-- Name: style_variant_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.style_variant_materials_id_seq OWNED BY public.style_variant_materials.id;


--
-- Name: style_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.style_variants (
    id integer NOT NULL,
    style_summary_id integer NOT NULL,
    style_name character varying NOT NULL,
    style_id character varying NOT NULL,
    colour_name character varying NOT NULL,
    colour_code character varying,
    colour_ref character varying,
    is_multicolor boolean,
    display_name character varying,
    piece_name character varying,
    sizes json,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.style_variants OWNER TO postgres;

--
-- Name: style_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.style_variants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.style_variants_id_seq OWNER TO postgres;

--
-- Name: style_variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.style_variants_id_seq OWNED BY public.style_variants.id;


--
-- Name: garment_colors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garment_colors ALTER COLUMN id SET DEFAULT nextval('public.garment_colors_id_seq'::regclass);


--
-- Name: garment_sizes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garment_sizes ALTER COLUMN id SET DEFAULT nextval('public.garment_sizes_id_seq'::regclass);


--
-- Name: manufacturing_operations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manufacturing_operations ALTER COLUMN id SET DEFAULT nextval('public.manufacturing_operations_id_seq'::regclass);


--
-- Name: material_master id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_master ALTER COLUMN id SET DEFAULT nextval('public.material_master_id_seq'::regclass);


--
-- Name: operation_master operation_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_master ALTER COLUMN operation_id SET DEFAULT nextval('public.operation_master_operation_id_seq'::regclass);


--
-- Name: operation_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_types ALTER COLUMN id SET DEFAULT nextval('public.operation_types_id_seq'::regclass);


--
-- Name: required_materials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.required_materials ALTER COLUMN id SET DEFAULT nextval('public.required_materials_id_seq'::regclass);


--
-- Name: sample_machines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_machines ALTER COLUMN id SET DEFAULT nextval('public.sample_machines_id_seq'::regclass);


--
-- Name: sample_operations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_operations ALTER COLUMN id SET DEFAULT nextval('public.sample_operations_id_seq'::regclass);


--
-- Name: sample_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_plans ALTER COLUMN id SET DEFAULT nextval('public.sample_plans_id_seq'::regclass);


--
-- Name: sample_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_requests ALTER COLUMN id SET DEFAULT nextval('public.sample_requests_id_seq'::regclass);


--
-- Name: sample_required_materials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_required_materials ALTER COLUMN id SET DEFAULT nextval('public.sample_required_materials_id_seq'::regclass);


--
-- Name: sample_status id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_status ALTER COLUMN id SET DEFAULT nextval('public.sample_status_id_seq'::regclass);


--
-- Name: sample_tna id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_tna ALTER COLUMN id SET DEFAULT nextval('public.sample_tna_id_seq'::regclass);


--
-- Name: samples id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.samples ALTER COLUMN id SET DEFAULT nextval('public.samples_id_seq'::regclass);


--
-- Name: smv_calculations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smv_calculations ALTER COLUMN id SET DEFAULT nextval('public.smv_calculations_id_seq'::regclass);


--
-- Name: smv_settings setting_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smv_settings ALTER COLUMN setting_id SET DEFAULT nextval('public.smv_settings_setting_id_seq'::regclass);


--
-- Name: style_operation_breakdown style_op_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_operation_breakdown ALTER COLUMN style_op_id SET DEFAULT nextval('public.style_operation_breakdown_style_op_id_seq'::regclass);


--
-- Name: style_smv smv_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_smv ALTER COLUMN smv_id SET DEFAULT nextval('public.style_smv_smv_id_seq'::regclass);


--
-- Name: style_summaries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_summaries ALTER COLUMN id SET DEFAULT nextval('public.style_summaries_id_seq'::regclass);


--
-- Name: style_variant_colors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_variant_colors ALTER COLUMN id SET DEFAULT nextval('public.style_variant_colors_id_seq'::regclass);


--
-- Name: style_variant_materials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_variant_materials ALTER COLUMN id SET DEFAULT nextval('public.style_variant_materials_id_seq'::regclass);


--
-- Name: style_variants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_variants ALTER COLUMN id SET DEFAULT nextval('public.style_variants_id_seq'::regclass);


--
-- Data for Name: garment_colors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.garment_colors (id, color_name, color_code, color_ref, category, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: garment_sizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.garment_sizes (id, size_value, size_label, size_category, sort_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: manufacturing_operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.manufacturing_operations (id, operation_id, operation_type, operation_name, standard_duration, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: material_master; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_master (id, material_name, uom, material_category, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: operation_master; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operation_master (operation_id, operation_name, machine_type, skill_level, standard_time, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: operation_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operation_types (id, operation_type, operation_name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: required_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.required_materials (id, style_variant_id, style_name, style_id, material, uom, consumption_per_piece, converted_uom, converted_consumption, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sample_machines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sample_machines (id, machine_code, machine_name, machine_type, gauge_capability, brand, location, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sample_operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sample_operations (id, sample_request_id, operation_master_id, operation_type, operation_name, sequence_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sample_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sample_plans (id, sample_request_id, assigned_designer, assigned_programmer, assigned_supervisor_knitting, assigned_supervisor_finishing, required_knitting_machine_id, delivery_plan_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sample_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sample_requests (id, sample_id, buyer_id, buyer_name, sample_name, style_id, gauge, ply, item, yarn_id, yarn_details, trims_ids, trims_details, decorative_part, decorative_details, yarn_handover_date, trims_handover_date, required_date, request_pcs, sample_category, color_name, size_name, additional_instruction, techpack_url, techpack_filename, round, current_status, created_at, updated_at) FROM stdin;
1	SMP-20260105-D8BAF7CA	1	test	test	\N		\N	test		""	[]	""			\N	\N	\N	\N	Fit						1	Pending	2026-01-05 03:49:34.392853+00	\N
\.


--
-- Data for Name: sample_required_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sample_required_materials (id, sample_request_id, product_category, product_id, product_name, category, sub_category, required_quantity, uom, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sample_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sample_status (id, sample_request_id, status_by_sample, status_from_merchandiser, notes, updated_by, expecting_end_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sample_tna; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sample_tna (id, sample_request_id, operation_sequence, operation_name, responsible_person, start_datetime, end_datetime, actual_start_datetime, actual_end_datetime, status, remark, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: samples; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.samples (id, sample_id, buyer_id, style_id, sample_type, sample_description, item, gauge, worksheet_rcv_date, yarn_rcv_date, required_date, color, assigned_designer, required_sample_quantity, round, notes, submit_status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: smv_calculations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.smv_calculations (id, style_variant_id, operation_id, operation_type, operation_name, number_of_operations, duration_hms, total_duration_minutes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: smv_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.smv_settings (setting_id, style_type, approval_factor, allowance_percent, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: style_operation_breakdown; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.style_operation_breakdown (style_op_id, style_variant_id, operation_id, machine_time, manual_time, finishing_time, total_basic_time, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: style_smv; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.style_smv (smv_id, style_variant_id, total_basic_time, total_smart_smv, approval_factor, created_date, updated_at) FROM stdin;
\.


--
-- Data for Name: style_summaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.style_summaries (id, buyer_id, style_name, style_id, product_category, product_type, customs_customer_group, type_of_construction, gauge, style_description, is_set, set_piece_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: style_variant_colors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.style_variant_colors (id, style_variant_id, part_name, colour_name, colour_code, colour_ref, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: style_variant_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.style_variant_materials (id, style_variant_id, style_material_id, product_category, sub_category, product_id, product_name, required_quantity, uom, weight, weight_uom, condition, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: style_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.style_variants (id, style_summary_id, style_name, style_id, colour_name, colour_code, colour_ref, is_multicolor, display_name, piece_name, sizes, created_at, updated_at) FROM stdin;
\.


--
-- Name: garment_colors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.garment_colors_id_seq', 1, false);


--
-- Name: garment_sizes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.garment_sizes_id_seq', 1, false);


--
-- Name: manufacturing_operations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.manufacturing_operations_id_seq', 1, false);


--
-- Name: material_master_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.material_master_id_seq', 1, false);


--
-- Name: operation_master_operation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operation_master_operation_id_seq', 1, false);


--
-- Name: operation_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operation_types_id_seq', 1, false);


--
-- Name: required_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.required_materials_id_seq', 1, false);


--
-- Name: sample_machines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sample_machines_id_seq', 1, false);


--
-- Name: sample_operations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sample_operations_id_seq', 1, false);


--
-- Name: sample_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sample_plans_id_seq', 1, false);


--
-- Name: sample_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sample_requests_id_seq', 1, true);


--
-- Name: sample_required_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sample_required_materials_id_seq', 1, false);


--
-- Name: sample_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sample_status_id_seq', 1, false);


--
-- Name: sample_tna_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sample_tna_id_seq', 1, false);


--
-- Name: samples_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.samples_id_seq', 1, false);


--
-- Name: smv_calculations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.smv_calculations_id_seq', 1, false);


--
-- Name: smv_settings_setting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.smv_settings_setting_id_seq', 1, false);


--
-- Name: style_operation_breakdown_style_op_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.style_operation_breakdown_style_op_id_seq', 1, false);


--
-- Name: style_smv_smv_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.style_smv_smv_id_seq', 1, false);


--
-- Name: style_summaries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.style_summaries_id_seq', 1, false);


--
-- Name: style_variant_colors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.style_variant_colors_id_seq', 1, false);


--
-- Name: style_variant_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.style_variant_materials_id_seq', 1, false);


--
-- Name: style_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.style_variants_id_seq', 1, false);


--
-- Name: garment_colors garment_colors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garment_colors
    ADD CONSTRAINT garment_colors_pkey PRIMARY KEY (id);


--
-- Name: garment_sizes garment_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garment_sizes
    ADD CONSTRAINT garment_sizes_pkey PRIMARY KEY (id);


--
-- Name: manufacturing_operations manufacturing_operations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manufacturing_operations
    ADD CONSTRAINT manufacturing_operations_pkey PRIMARY KEY (id);


--
-- Name: material_master material_master_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_master
    ADD CONSTRAINT material_master_pkey PRIMARY KEY (id);


--
-- Name: operation_master operation_master_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_master
    ADD CONSTRAINT operation_master_pkey PRIMARY KEY (operation_id);


--
-- Name: operation_types operation_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_types
    ADD CONSTRAINT operation_types_pkey PRIMARY KEY (id);


--
-- Name: required_materials required_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.required_materials
    ADD CONSTRAINT required_materials_pkey PRIMARY KEY (id);


--
-- Name: sample_machines sample_machines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_machines
    ADD CONSTRAINT sample_machines_pkey PRIMARY KEY (id);


--
-- Name: sample_operations sample_operations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_operations
    ADD CONSTRAINT sample_operations_pkey PRIMARY KEY (id);


--
-- Name: sample_plans sample_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_plans
    ADD CONSTRAINT sample_plans_pkey PRIMARY KEY (id);


--
-- Name: sample_plans sample_plans_sample_request_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_plans
    ADD CONSTRAINT sample_plans_sample_request_id_key UNIQUE (sample_request_id);


--
-- Name: sample_requests sample_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_requests
    ADD CONSTRAINT sample_requests_pkey PRIMARY KEY (id);


--
-- Name: sample_required_materials sample_required_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_required_materials
    ADD CONSTRAINT sample_required_materials_pkey PRIMARY KEY (id);


--
-- Name: sample_status sample_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_status
    ADD CONSTRAINT sample_status_pkey PRIMARY KEY (id);


--
-- Name: sample_tna sample_tna_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_tna
    ADD CONSTRAINT sample_tna_pkey PRIMARY KEY (id);


--
-- Name: samples samples_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT samples_pkey PRIMARY KEY (id);


--
-- Name: smv_calculations smv_calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smv_calculations
    ADD CONSTRAINT smv_calculations_pkey PRIMARY KEY (id);


--
-- Name: smv_settings smv_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smv_settings
    ADD CONSTRAINT smv_settings_pkey PRIMARY KEY (setting_id);


--
-- Name: style_operation_breakdown style_operation_breakdown_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_operation_breakdown
    ADD CONSTRAINT style_operation_breakdown_pkey PRIMARY KEY (style_op_id);


--
-- Name: style_smv style_smv_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_smv
    ADD CONSTRAINT style_smv_pkey PRIMARY KEY (smv_id);


--
-- Name: style_summaries style_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_summaries
    ADD CONSTRAINT style_summaries_pkey PRIMARY KEY (id);


--
-- Name: style_variant_colors style_variant_colors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_variant_colors
    ADD CONSTRAINT style_variant_colors_pkey PRIMARY KEY (id);


--
-- Name: style_variant_materials style_variant_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_variant_materials
    ADD CONSTRAINT style_variant_materials_pkey PRIMARY KEY (id);


--
-- Name: style_variants style_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_variants
    ADD CONSTRAINT style_variants_pkey PRIMARY KEY (id);


--
-- Name: ix_garment_colors_color_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_garment_colors_color_name ON public.garment_colors USING btree (color_name);


--
-- Name: ix_garment_colors_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_garment_colors_id ON public.garment_colors USING btree (id);


--
-- Name: ix_garment_sizes_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_garment_sizes_id ON public.garment_sizes USING btree (id);


--
-- Name: ix_garment_sizes_size_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_garment_sizes_size_value ON public.garment_sizes USING btree (size_value);


--
-- Name: ix_manufacturing_operations_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_manufacturing_operations_id ON public.manufacturing_operations USING btree (id);


--
-- Name: ix_manufacturing_operations_operation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_manufacturing_operations_operation_id ON public.manufacturing_operations USING btree (operation_id);


--
-- Name: ix_manufacturing_operations_operation_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_manufacturing_operations_operation_type ON public.manufacturing_operations USING btree (operation_type);


--
-- Name: ix_material_master_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_material_master_id ON public.material_master USING btree (id);


--
-- Name: ix_material_master_material_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_material_master_material_name ON public.material_master USING btree (material_name);


--
-- Name: ix_operation_master_operation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_operation_master_operation_id ON public.operation_master USING btree (operation_id);


--
-- Name: ix_operation_master_operation_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_operation_master_operation_name ON public.operation_master USING btree (operation_name);


--
-- Name: ix_operation_types_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_operation_types_id ON public.operation_types USING btree (id);


--
-- Name: ix_operation_types_operation_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_operation_types_operation_type ON public.operation_types USING btree (operation_type);


--
-- Name: ix_required_materials_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_required_materials_id ON public.required_materials USING btree (id);


--
-- Name: ix_sample_machines_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_machines_id ON public.sample_machines USING btree (id);


--
-- Name: ix_sample_machines_machine_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_sample_machines_machine_code ON public.sample_machines USING btree (machine_code);


--
-- Name: ix_sample_operations_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_operations_id ON public.sample_operations USING btree (id);


--
-- Name: ix_sample_plans_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_plans_id ON public.sample_plans USING btree (id);


--
-- Name: ix_sample_requests_buyer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_requests_buyer_id ON public.sample_requests USING btree (buyer_id);


--
-- Name: ix_sample_requests_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_requests_id ON public.sample_requests USING btree (id);


--
-- Name: ix_sample_requests_sample_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_sample_requests_sample_id ON public.sample_requests USING btree (sample_id);


--
-- Name: ix_sample_requests_sample_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_requests_sample_name ON public.sample_requests USING btree (sample_name);


--
-- Name: ix_sample_required_materials_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_required_materials_id ON public.sample_required_materials USING btree (id);


--
-- Name: ix_sample_status_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_status_id ON public.sample_status USING btree (id);


--
-- Name: ix_sample_tna_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sample_tna_id ON public.sample_tna USING btree (id);


--
-- Name: ix_samples_buyer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_samples_buyer_id ON public.samples USING btree (buyer_id);


--
-- Name: ix_samples_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_samples_id ON public.samples USING btree (id);


--
-- Name: ix_samples_sample_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_samples_sample_id ON public.samples USING btree (sample_id);


--
-- Name: ix_smv_calculations_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_smv_calculations_id ON public.smv_calculations USING btree (id);


--
-- Name: ix_smv_settings_setting_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_smv_settings_setting_id ON public.smv_settings USING btree (setting_id);


--
-- Name: ix_smv_settings_style_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_smv_settings_style_type ON public.smv_settings USING btree (style_type);


--
-- Name: ix_style_operation_breakdown_style_op_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_operation_breakdown_style_op_id ON public.style_operation_breakdown USING btree (style_op_id);


--
-- Name: ix_style_smv_smv_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_smv_smv_id ON public.style_smv USING btree (smv_id);


--
-- Name: ix_style_summaries_buyer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_summaries_buyer_id ON public.style_summaries USING btree (buyer_id);


--
-- Name: ix_style_summaries_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_summaries_id ON public.style_summaries USING btree (id);


--
-- Name: ix_style_summaries_style_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_style_summaries_style_id ON public.style_summaries USING btree (style_id);


--
-- Name: ix_style_summaries_style_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_summaries_style_name ON public.style_summaries USING btree (style_name);


--
-- Name: ix_style_variant_colors_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_variant_colors_id ON public.style_variant_colors USING btree (id);


--
-- Name: ix_style_variant_materials_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_variant_materials_id ON public.style_variant_materials USING btree (id);


--
-- Name: ix_style_variants_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_variants_id ON public.style_variants USING btree (id);


--
-- Name: ix_style_variants_style_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_style_variants_style_id ON public.style_variants USING btree (style_id);


--
-- Name: required_materials required_materials_style_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.required_materials
    ADD CONSTRAINT required_materials_style_variant_id_fkey FOREIGN KEY (style_variant_id) REFERENCES public.style_variants(id);


--
-- Name: sample_operations sample_operations_operation_master_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_operations
    ADD CONSTRAINT sample_operations_operation_master_id_fkey FOREIGN KEY (operation_master_id) REFERENCES public.manufacturing_operations(id);


--
-- Name: sample_operations sample_operations_sample_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_operations
    ADD CONSTRAINT sample_operations_sample_request_id_fkey FOREIGN KEY (sample_request_id) REFERENCES public.sample_requests(id) ON DELETE CASCADE;


--
-- Name: sample_plans sample_plans_required_knitting_machine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_plans
    ADD CONSTRAINT sample_plans_required_knitting_machine_id_fkey FOREIGN KEY (required_knitting_machine_id) REFERENCES public.sample_machines(id);


--
-- Name: sample_plans sample_plans_sample_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_plans
    ADD CONSTRAINT sample_plans_sample_request_id_fkey FOREIGN KEY (sample_request_id) REFERENCES public.sample_requests(id) ON DELETE CASCADE;


--
-- Name: sample_requests sample_requests_style_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_requests
    ADD CONSTRAINT sample_requests_style_id_fkey FOREIGN KEY (style_id) REFERENCES public.style_summaries(id);


--
-- Name: sample_required_materials sample_required_materials_sample_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_required_materials
    ADD CONSTRAINT sample_required_materials_sample_request_id_fkey FOREIGN KEY (sample_request_id) REFERENCES public.sample_requests(id) ON DELETE CASCADE;


--
-- Name: sample_status sample_status_sample_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_status
    ADD CONSTRAINT sample_status_sample_request_id_fkey FOREIGN KEY (sample_request_id) REFERENCES public.sample_requests(id) ON DELETE CASCADE;


--
-- Name: sample_tna sample_tna_sample_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample_tna
    ADD CONSTRAINT sample_tna_sample_request_id_fkey FOREIGN KEY (sample_request_id) REFERENCES public.sample_requests(id) ON DELETE CASCADE;


--
-- Name: samples samples_style_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT samples_style_id_fkey FOREIGN KEY (style_id) REFERENCES public.style_summaries(id);


--
-- Name: smv_calculations smv_calculations_operation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smv_calculations
    ADD CONSTRAINT smv_calculations_operation_id_fkey FOREIGN KEY (operation_id) REFERENCES public.manufacturing_operations(id);


--
-- Name: smv_calculations smv_calculations_style_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smv_calculations
    ADD CONSTRAINT smv_calculations_style_variant_id_fkey FOREIGN KEY (style_variant_id) REFERENCES public.style_variants(id) ON DELETE CASCADE;


--
-- Name: style_operation_breakdown style_operation_breakdown_operation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_operation_breakdown
    ADD CONSTRAINT style_operation_breakdown_operation_id_fkey FOREIGN KEY (operation_id) REFERENCES public.operation_master(operation_id);


--
-- Name: style_operation_breakdown style_operation_breakdown_style_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_operation_breakdown
    ADD CONSTRAINT style_operation_breakdown_style_variant_id_fkey FOREIGN KEY (style_variant_id) REFERENCES public.style_variants(id);


--
-- Name: style_smv style_smv_style_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_smv
    ADD CONSTRAINT style_smv_style_variant_id_fkey FOREIGN KEY (style_variant_id) REFERENCES public.style_variants(id);


--
-- Name: style_variant_colors style_variant_colors_style_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_variant_colors
    ADD CONSTRAINT style_variant_colors_style_variant_id_fkey FOREIGN KEY (style_variant_id) REFERENCES public.style_variants(id) ON DELETE CASCADE;


--
-- Name: style_variant_materials style_variant_materials_style_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_variant_materials
    ADD CONSTRAINT style_variant_materials_style_variant_id_fkey FOREIGN KEY (style_variant_id) REFERENCES public.style_variants(id) ON DELETE CASCADE;


--
-- Name: style_variants style_variants_style_summary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.style_variants
    ADD CONSTRAINT style_variants_style_summary_id_fkey FOREIGN KEY (style_summary_id) REFERENCES public.style_summaries(id);


--
-- PostgreSQL database dump complete
--

\unrestrict cNolWkDj3TFpTIvbpwQJ6LSsL1VfbukYuh3nZPK6dgdPwYt5HRrRzZBSnEswjT7

