--
-- PostgreSQL database dump
--

\restrict wXj1Zy5s857iufXrthvmtCSeCeJNNFH25iD3WGxtHPZERbZ9YKkbphcPWfivyDx

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
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id integer NOT NULL,
    branch_code character varying(50) NOT NULL,
    branch_name character varying(255) NOT NULL,
    branch_type character varying(50),
    is_head_office boolean,
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    state character varying(100),
    country character varying(100),
    postal_code character varying(20),
    phone character varying(50),
    email character varying(255),
    manager_name character varying(255),
    is_active boolean,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.branches_id_seq OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: chart_of_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chart_of_accounts (
    id integer NOT NULL,
    account_code character varying(50) NOT NULL,
    account_name character varying(255) NOT NULL,
    account_type character varying(50) NOT NULL,
    account_category character varying(100),
    parent_account_id integer,
    level integer,
    is_header boolean,
    is_active boolean,
    is_system_account boolean,
    opening_balance numeric(18,2),
    current_balance numeric(18,2),
    currency_id integer,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.chart_of_accounts OWNER TO postgres;

--
-- Name: chart_of_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chart_of_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chart_of_accounts_id_seq OWNER TO postgres;

--
-- Name: chart_of_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chart_of_accounts_id_seq OWNED BY public.chart_of_accounts.id;


--
-- Name: city; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.city (
    id integer NOT NULL,
    city_id character varying(50) NOT NULL,
    city_name character varying(100) NOT NULL,
    country_id integer NOT NULL,
    state_province character varying(100),
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.city OWNER TO postgres;

--
-- Name: city_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.city_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.city_id_seq OWNER TO postgres;

--
-- Name: city_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.city_id_seq OWNED BY public.city.id;


--
-- Name: color; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.color (
    id integer NOT NULL,
    color character varying(100) NOT NULL,
    color_family_id integer NOT NULL,
    color_code character varying(50),
    color_code_type character varying(50),
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.color OWNER TO postgres;

--
-- Name: color_family; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.color_family (
    id integer NOT NULL,
    color_family character varying(50) NOT NULL,
    color_family_code character varying(20),
    color_family_code_type character varying(50),
    sort_order integer,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.color_family OWNER TO postgres;

--
-- Name: color_family_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.color_family_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.color_family_id_seq OWNER TO postgres;

--
-- Name: color_family_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.color_family_id_seq OWNED BY public.color_family.id;


--
-- Name: color_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.color_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.color_id_seq OWNER TO postgres;

--
-- Name: color_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.color_id_seq OWNED BY public.color.id;


--
-- Name: color_master; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.color_master (
    id integer NOT NULL,
    color_id integer NOT NULL,
    color_family_id integer NOT NULL,
    color_value_id integer,
    color_name character varying(255) NOT NULL,
    color_code_type character varying(50),
    color_code character varying(100),
    hex_value character varying(7),
    is_active boolean,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.color_master OWNER TO postgres;

--
-- Name: color_master_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.color_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.color_master_id_seq OWNER TO postgres;

--
-- Name: color_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.color_master_id_seq OWNED BY public.color_master.id;


--
-- Name: color_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.color_value (
    id integer NOT NULL,
    color_value_code character varying(50) NOT NULL,
    color_value_code_type character varying(100) NOT NULL,
    sort_order integer,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.color_value OWNER TO postgres;

--
-- Name: color_value_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.color_value_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.color_value_id_seq OWNER TO postgres;

--
-- Name: color_value_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.color_value_id_seq OWNED BY public.color_value.id;


--
-- Name: company_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_profile (
    id integer NOT NULL,
    company_name character varying(255) NOT NULL,
    legal_name character varying(255),
    registration_number character varying(100),
    tax_id character varying(100),
    logo_url character varying(500),
    website character varying(255),
    email character varying(255),
    phone character varying(50),
    fax character varying(50),
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    state character varying(100),
    country character varying(100),
    postal_code character varying(20),
    default_currency_id integer,
    fiscal_year_start_month integer,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.company_profile OWNER TO postgres;

--
-- Name: company_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_profile_id_seq OWNER TO postgres;

--
-- Name: company_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_profile_id_seq OWNED BY public.company_profile.id;


--
-- Name: country; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.country (
    id integer NOT NULL,
    country_id character varying(10) NOT NULL,
    country_name character varying(100) NOT NULL,
    international_country_code character varying(3),
    international_dialing_number character varying(10),
    currency_code character varying(3),
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.country OWNER TO postgres;

--
-- Name: country_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.country_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.country_id_seq OWNER TO postgres;

--
-- Name: country_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.country_id_seq OWNED BY public.country.id;


--
-- Name: currencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.currencies (
    id integer NOT NULL,
    currency_code character varying(3) NOT NULL,
    currency_name character varying(100) NOT NULL,
    symbol character varying(10),
    decimal_places integer,
    is_base_currency boolean,
    exchange_rate numeric(18,6),
    rate_updated_at timestamp with time zone,
    is_active boolean,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.currencies OWNER TO postgres;

--
-- Name: currencies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.currencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.currencies_id_seq OWNER TO postgres;

--
-- Name: currencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.currencies_id_seq OWNED BY public.currencies.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    department_code character varying(50) NOT NULL,
    department_name character varying(100) NOT NULL,
    parent_department_id integer,
    branch_id integer,
    manager_user_id integer,
    cost_center_code character varying(50),
    is_active boolean,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: document_numbering; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_numbering (
    id integer NOT NULL,
    document_type character varying(100) NOT NULL,
    document_name character varying(255) NOT NULL,
    prefix character varying(20),
    suffix character varying(20),
    current_number integer,
    number_length integer,
    fiscal_year_reset boolean,
    branch_wise boolean,
    sample_format character varying(100),
    is_active boolean,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.document_numbering OWNER TO postgres;

--
-- Name: document_numbering_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.document_numbering_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.document_numbering_id_seq OWNER TO postgres;

--
-- Name: document_numbering_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.document_numbering_id_seq OWNED BY public.document_numbering.id;


--
-- Name: fiscal_year; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fiscal_year (
    id integer NOT NULL,
    fiscal_year_code character varying(20) NOT NULL,
    fiscal_year_name character varying(100) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_current boolean,
    is_closed boolean,
    closed_date timestamp with time zone,
    closed_by_user_id integer,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.fiscal_year OWNER TO postgres;

--
-- Name: fiscal_year_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fiscal_year_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fiscal_year_id_seq OWNER TO postgres;

--
-- Name: fiscal_year_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fiscal_year_id_seq OWNED BY public.fiscal_year.id;


--
-- Name: per_minute_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.per_minute_value (
    id integer NOT NULL,
    date_of_value_set date NOT NULL,
    value numeric(10,4) NOT NULL,
    currency_id integer,
    amendment_no character varying(20),
    effective_from date NOT NULL,
    effective_to date,
    is_current boolean,
    approved_by_user_id integer,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.per_minute_value OWNER TO postgres;

--
-- Name: per_minute_value_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.per_minute_value_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.per_minute_value_id_seq OWNER TO postgres;

--
-- Name: per_minute_value_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.per_minute_value_id_seq OWNED BY public.per_minute_value.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    permission_code character varying(100) NOT NULL,
    permission_name character varying(255) NOT NULL,
    module character varying(100) NOT NULL,
    action character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: port; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.port (
    id integer NOT NULL,
    country_id integer NOT NULL,
    city_id integer,
    locode character varying(5) NOT NULL,
    port_name character varying(255) NOT NULL,
    name_wo_diacritics character varying(255),
    subdivision character varying(10),
    function character varying(20),
    status character varying(10),
    date character varying(10),
    iata character varying(3),
    coordinates character varying(50),
    remarks text,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.port OWNER TO postgres;

--
-- Name: port_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.port_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.port_id_seq OWNER TO postgres;

--
-- Name: port_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.port_id_seq OWNED BY public.port.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_permissions_id_seq OWNER TO postgres;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    role_code character varying(50) NOT NULL,
    role_name character varying(100) NOT NULL,
    description text,
    is_system_role boolean,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: taxes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.taxes (
    id integer NOT NULL,
    tax_code character varying(50) NOT NULL,
    tax_name character varying(100) NOT NULL,
    tax_type character varying(50),
    rate numeric(8,4) NOT NULL,
    is_compound boolean,
    is_recoverable boolean,
    account_id integer,
    is_active boolean,
    effective_from date,
    effective_to date,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.taxes OWNER TO postgres;

--
-- Name: taxes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.taxes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.taxes_id_seq OWNER TO postgres;

--
-- Name: taxes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.taxes_id_seq OWNED BY public.taxes.id;


--
-- Name: uom; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.uom (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying(100) NOT NULL,
    symbol character varying(20) NOT NULL,
    factor numeric(18,8),
    is_base boolean,
    is_active boolean,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.uom OWNER TO postgres;

--
-- Name: uom_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.uom_category (
    id integer NOT NULL,
    uom_category character varying(100) NOT NULL,
    uom_id character varying(50),
    uom_name character varying(100) NOT NULL,
    uom_description text,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.uom_category OWNER TO postgres;

--
-- Name: uom_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.uom_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.uom_category_id_seq OWNER TO postgres;

--
-- Name: uom_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.uom_category_id_seq OWNED BY public.uom_category.id;


--
-- Name: uom_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.uom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.uom_id_seq OWNER TO postgres;

--
-- Name: uom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.uom_id_seq OWNED BY public.uom.id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    id integer NOT NULL,
    warehouse_code character varying(50) NOT NULL,
    warehouse_name character varying(255) NOT NULL,
    warehouse_type character varying(50),
    branch_id integer,
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    country character varying(100),
    manager_name character varying(255),
    capacity_sqft numeric(12,2),
    is_default boolean,
    is_active boolean,
    remarks text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.warehouses_id_seq OWNER TO postgres;

--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: chart_of_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chart_of_accounts ALTER COLUMN id SET DEFAULT nextval('public.chart_of_accounts_id_seq'::regclass);


--
-- Name: city id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city ALTER COLUMN id SET DEFAULT nextval('public.city_id_seq'::regclass);


--
-- Name: color id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color ALTER COLUMN id SET DEFAULT nextval('public.color_id_seq'::regclass);


--
-- Name: color_family id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_family ALTER COLUMN id SET DEFAULT nextval('public.color_family_id_seq'::regclass);


--
-- Name: color_master id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_master ALTER COLUMN id SET DEFAULT nextval('public.color_master_id_seq'::regclass);


--
-- Name: color_value id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_value ALTER COLUMN id SET DEFAULT nextval('public.color_value_id_seq'::regclass);


--
-- Name: company_profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_profile ALTER COLUMN id SET DEFAULT nextval('public.company_profile_id_seq'::regclass);


--
-- Name: country id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.country ALTER COLUMN id SET DEFAULT nextval('public.country_id_seq'::regclass);


--
-- Name: currencies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currencies ALTER COLUMN id SET DEFAULT nextval('public.currencies_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: document_numbering id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_numbering ALTER COLUMN id SET DEFAULT nextval('public.document_numbering_id_seq'::regclass);


--
-- Name: fiscal_year id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiscal_year ALTER COLUMN id SET DEFAULT nextval('public.fiscal_year_id_seq'::regclass);


--
-- Name: per_minute_value id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.per_minute_value ALTER COLUMN id SET DEFAULT nextval('public.per_minute_value_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: port id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.port ALTER COLUMN id SET DEFAULT nextval('public.port_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: taxes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes ALTER COLUMN id SET DEFAULT nextval('public.taxes_id_seq'::regclass);


--
-- Name: uom id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uom ALTER COLUMN id SET DEFAULT nextval('public.uom_id_seq'::regclass);


--
-- Name: uom_category id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uom_category ALTER COLUMN id SET DEFAULT nextval('public.uom_category_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, branch_code, branch_name, branch_type, is_head_office, address_line1, address_line2, city, state, country, postal_code, phone, email, manager_name, is_active, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: chart_of_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chart_of_accounts (id, account_code, account_name, account_type, account_category, parent_account_id, level, is_header, is_active, is_system_account, opening_balance, current_balance, currency_id, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: city; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.city (id, city_id, city_name, country_id, state_province, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: color; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.color (id, color, color_family_id, color_code, color_code_type, is_active, created_at, updated_at) FROM stdin;
1	NAVY BLUE	1	#001F3F	\N	t	2026-01-05 07:08:52.943128+00	\N
2	HEATHER GREY	2	#B0B0B0	\N	t	2026-01-05 07:08:53.010267+00	\N
3	RED	3	#FF0000	\N	t	2026-01-05 07:08:53.059813+00	\N
4	BLACK	2	#000000	\N	t	2026-01-05 07:08:53.084166+00	\N
5	WHITE	2	#FFFFFF	\N	t	2026-01-05 07:08:53.109589+00	\N
6	OLIVE GREEN	4	#556B2F	\N	t	2026-01-05 07:08:53.15207+00	\N
7	BURGUNDY	3	#800020	\N	t	2026-01-05 07:08:53.177057+00	\N
8	SKY BLUE	1	#87CEEB	\N	t	2026-01-05 07:08:53.194184+00	\N
9	BEIGE	2	#F5F5DC	\N	t	2026-01-05 07:08:53.210943+00	\N
10	MELANGE NAVY	1	#223344	\N	t	2026-01-05 07:08:53.227084+00	\N
11	BEIGE	5	\N	\N	t	2026-01-05 07:08:53.260342+00	\N
12	BLACK	6	\N	\N	t	2026-01-05 07:10:43.343852+00	\N
13	BLUE	1	\N	\N	t	2026-01-05 07:10:43.372135+00	\N
14	BLUISH GREEN	7	\N	\N	t	2026-01-05 07:10:45.508954+00	\N
15	BROWN	8	\N	\N	t	2026-01-05 07:10:45.543281+00	\N
16	GREEN	4	\N	\N	t	2026-01-05 07:10:45.584967+00	\N
17	GREY	9	\N	\N	t	2026-01-05 07:10:49.419236+00	\N
18	KHAKI GREEN	10	\N	\N	t	2026-01-05 07:10:50.502598+00	\N
19	LILAC PURPLE	11	\N	\N	t	2026-01-05 07:10:51.058408+00	\N
20	METAL	12	\N	\N	t	2026-01-05 07:10:52.513104+00	\N
21	MOLE	13	\N	\N	t	2026-01-05 07:10:52.633925+00	\N
22	ORANGE	14	\N	\N	t	2026-01-05 07:10:53.573513+00	\N
23	PINK	15	\N	\N	t	2026-01-05 07:10:55.471243+00	\N
24	TURQUOISE	16	\N	\N	t	2026-01-05 07:10:58.58993+00	\N
25	UNDEFINED	17	\N	\N	t	2026-01-05 07:10:59.959783+00	\N
26	WHITE	18	\N	\N	t	2026-01-05 07:11:00.714353+00	\N
27	YELLOW	19	\N	\N	t	2026-01-05 07:11:01.050961+00	\N
28	YELLOWISH GREEN	20	\N	\N	t	2026-01-05 07:11:02.613855+00	\N
\.


--
-- Data for Name: color_family; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.color_family (id, color_family, color_family_code, color_family_code_type, sort_order, is_active, created_at, updated_at) FROM stdin;
1	BLUE	BLU	\N	0	t	2026-01-05 07:08:52.919239+00	\N
2	NEUTRAL	NEU	\N	0	t	2026-01-05 07:08:52.980584+00	\N
3	RED	RED	\N	0	t	2026-01-05 07:08:53.038801+00	\N
4	GREEN	GRE	\N	0	t	2026-01-05 07:08:53.136978+00	\N
5	BEIGE	BEI	\N	0	t	2026-01-05 07:08:53.244658+00	\N
6	BLACK	BLA	\N	0	t	2026-01-05 07:10:41.954916+00	\N
7	BLUISH GREEN	BLU	\N	0	t	2026-01-05 07:10:43.851107+00	\N
8	BROWN	BRO	\N	0	t	2026-01-05 07:10:45.533434+00	\N
9	GREY	GRE	\N	0	t	2026-01-05 07:10:47.143464+00	\N
10	KHAKI GREEN	KHA	\N	0	t	2026-01-05 07:10:50.453327+00	\N
11	LILAC PURPLE	LIL	\N	0	t	2026-01-05 07:10:50.573846+00	\N
12	METAL	MET	\N	0	t	2026-01-05 07:10:51.191129+00	\N
13	MOLE	MOL	\N	0	t	2026-01-05 07:10:52.617716+00	\N
14	ORANGE	ORA	\N	0	t	2026-01-05 07:10:52.690239+00	\N
15	PINK	PIN	\N	0	t	2026-01-05 07:10:53.833456+00	\N
16	TURQUOISE	TUR	\N	0	t	2026-01-05 07:10:57.785144+00	\N
17	UNDEFINED	UND	\N	0	t	2026-01-05 07:10:58.759105+00	\N
18	WHITE	WHI	\N	0	t	2026-01-05 07:10:59.981544+00	\N
19	YELLOW	YEL	\N	0	t	2026-01-05 07:11:00.957968+00	\N
20	YELLOWISH GREEN	YEL	\N	0	t	2026-01-05 07:11:01.358031+00	\N
\.


--
-- Data for Name: color_master; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.color_master (id, color_id, color_family_id, color_value_id, color_name, color_code_type, color_code, hex_value, is_active, remarks, created_at, updated_at) FROM stdin;
1	1	1	1	Navy Blue	H&M	32-207	#001F3F	t	\N	2026-01-05 07:08:52.980584+00	\N
2	2	2	2	Heather Grey	H&M	32-202	#B0B0B0	t	\N	2026-01-05 07:08:53.038801+00	\N
3	3	3	3	Red	H&M	32-105	#FF0000	t	\N	2026-01-05 07:08:53.084166+00	\N
4	4	2	4	Black	H&M	32-104	#000000	t	\N	2026-01-05 07:08:53.109589+00	\N
5	5	2	5	White	H&M	31-211	#FFFFFF	t	\N	2026-01-05 07:08:53.136978+00	\N
6	6	4	6	Olive Green	H&M	31-114	#556B2F	t	\N	2026-01-05 07:08:53.177057+00	\N
7	7	3	1	Burgundy	H&M	28-113	#800020	t	\N	2026-01-05 07:08:53.194184+00	\N
8	8	1	2	Sky Blue	H&M	28-112	#87CEEB	t	\N	2026-01-05 07:08:53.210943+00	\N
9	9	2	3	Beige	H&M	28-109	#F5F5DC	t	\N	2026-01-05 07:08:53.227084+00	\N
10	10	1	4	Melange Navy	H&M	28-103	#223344	t	\N	2026-01-05 07:08:53.244658+00	\N
15	11	5	1	BEIGE MEDIUM DUSTY	H&M	51-138	\N	t	\N	2026-01-05 07:10:41.787918+00	\N
16	11	5	2	BEIGE DARK	H&M	39-102	\N	t	\N	2026-01-05 07:10:41.852609+00	\N
17	11	5	3	BEIGE DUSTY LIGHT	H&M	24-114	\N	t	\N	2026-01-05 07:10:41.868594+00	\N
18	12	6	2	BLACK DARK	H&M	09-111	\N	t	\N	2026-01-05 07:10:43.355624+00	\N
19	13	1	1	BLUE MEDIUM DUSTY	H&M	87-128	\N	t	\N	2026-01-05 07:10:43.459124+00	\N
20	13	1	3	BLUE DUSTY LIGHT	H&M	84-102	\N	t	\N	2026-01-05 07:10:43.470898+00	\N
21	13	1	4	BLUE BRIGHT	H&M	79-305	\N	t	\N	2026-01-05 07:10:43.486075+00	\N
22	13	1	2	BLUE DARK	H&M	79-224	\N	t	\N	2026-01-05 07:10:43.529191+00	\N
23	13	1	5	BLUE MEDIUM	H&M	79-218	\N	t	\N	2026-01-05 07:10:43.559041+00	\N
24	13	1	6	BLUE LIGHT	H&M	78-209	\N	t	\N	2026-01-05 07:10:43.587335+00	\N
25	14	7	3	BLUISH GREEN DUSTY LIGHT	H&M	91-215	\N	t	\N	2026-01-05 07:10:45.519147+00	\N
26	15	8	2	BROWN DARK	H&M	63-103	\N	t	\N	2026-01-05 07:10:45.553412+00	\N
27	15	8	1	BROWN MEDIUM DUSTY	H&M	53-102	\N	t	\N	2026-01-05 07:10:45.569314+00	\N
28	16	4	2	GREEN DARK	H&M	99-305	\N	t	\N	2026-01-05 07:10:46.624637+00	\N
29	16	4	5	GREEN MEDIUM	H&M	99-304	\N	t	\N	2026-01-05 07:10:46.637066+00	\N
30	16	4	1	GREEN MEDIUM DUSTY	H&M	99-235	\N	t	\N	2026-01-05 07:10:46.652266+00	\N
31	16	4	4	GREEN BRIGHT	H&M	98-326	\N	t	\N	2026-01-05 07:10:46.694735+00	\N
32	16	4	6	GREEN LIGHT	H&M	98-319	\N	t	\N	2026-01-05 07:10:46.926517+00	\N
33	16	4	3	GREEN DUSTY LIGHT	H&M	98-226	\N	t	\N	2026-01-05 07:10:46.97702+00	\N
34	17	9	1	GREY MEDIUM DUSTY	H&M	95-109	\N	t	\N	2026-01-05 07:10:49.426561+00	\N
35	17	9	3	GREY DUSTY LIGHT	H&M	94-101	\N	t	\N	2026-01-05 07:10:49.433308+00	\N
36	17	9	2	GREY DARK	H&M	86-115	\N	t	\N	2026-01-05 07:10:49.442519+00	\N
37	17	9	6	GREY LIGHT	H&M	06-110	\N	t	\N	2026-01-05 07:10:49.47032+00	\N
38	18	10	2	KHAKI GREEN DARK	H&M	99-301	\N	t	\N	2026-01-05 07:10:50.51435+00	\N
39	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	98-239	\N	t	\N	2026-01-05 07:10:50.526643+00	\N
40	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	96-118	\N	t	\N	2026-01-05 07:10:50.550384+00	\N
41	19	11	2	LILAC PURPLE DARK	H&M	73-316	\N	t	\N	2026-01-05 07:10:51.067899+00	\N
42	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	73-207	\N	t	\N	2026-01-05 07:10:51.082264+00	\N
43	19	11	4	LILAC PURPLE BRIGHT	H&M	72-310	\N	t	\N	2026-01-05 07:10:51.096955+00	\N
44	19	11	5	LILAC PURPLE MEDIUM	H&M	72-309	\N	t	\N	2026-01-05 07:10:51.129327+00	\N
45	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	72-209	\N	t	\N	2026-01-05 07:10:51.143812+00	\N
46	19	11	6	LILAC PURPLE LIGHT	H&M	72-206	\N	t	\N	2026-01-05 07:10:51.172567+00	\N
47	20	12	5	METAL MEDIUM	H&M	05-103	\N	t	\N	2026-01-05 07:10:52.517866+00	\N
48	20	12	4	METAL BRIGHT	H&M	05-102	\N	t	\N	2026-01-05 07:10:52.533053+00	\N
49	20	12	2	METAL DARK	H&M	04-103	\N	t	\N	2026-01-05 07:10:52.548133+00	\N
50	20	12	1	METAL MEDIUM DUSTY	H&M	04-102	\N	t	\N	2026-01-05 07:10:52.567478+00	\N
51	20	12	3	METAL DUSTY LIGHT	H&M	03-103	\N	t	\N	2026-01-05 07:10:52.582863+00	\N
52	20	12	6	METAL LIGHT	H&M	03-102	\N	t	\N	2026-01-05 07:10:52.602347+00	\N
53	21	13	3	MOLE DUSTY LIGHT	H&M	94-127	\N	t	\N	2026-01-05 07:10:52.643038+00	\N
54	21	13	2	MOLE DARK	H&M	63-116	\N	t	\N	2026-01-05 07:10:52.6567+00	\N
55	21	13	1	MOLE MEDIUM DUSTY	H&M	56-105	\N	t	\N	2026-01-05 07:10:52.670045+00	\N
56	22	14	6	ORANGE LIGHT	H&M	51-213	\N	t	\N	2026-01-05 07:10:53.58469+00	\N
57	22	14	3	ORANGE DUSTY LIGHT	H&M	51-115	\N	t	\N	2026-01-05 07:10:53.602592+00	\N
58	22	14	2	ORANGE DARK	H&M	43-309	\N	t	\N	2026-01-05 07:10:53.626718+00	\N
59	22	14	4	ORANGE BRIGHT	H&M	41-202	\N	t	\N	2026-01-05 07:10:53.657698+00	\N
60	22	14	5	ORANGE MEDIUM	H&M	39-314	\N	t	\N	2026-01-05 07:10:53.734758+00	\N
61	22	14	1	ORANGE MEDIUM DUSTY	H&M	39-223	\N	t	\N	2026-01-05 07:10:53.764023+00	\N
62	23	15	1	PINK MEDIUM DUSTY	H&M	72-211	\N	t	\N	2026-01-05 07:10:55.484443+00	\N
63	23	15	5	PINK MEDIUM	H&M	62-208	\N	t	\N	2026-01-05 07:10:55.49762+00	\N
64	23	15	6	PINK LIGHT	H&M	61-204	\N	t	\N	2026-01-05 07:10:55.530346+00	\N
65	23	15	3	PINK DUSTY LIGHT	H&M	61-202	\N	t	\N	2026-01-05 07:10:55.5605+00	\N
66	23	15	2	PINK DARK	H&M	59-309	\N	t	\N	2026-01-05 07:10:55.574699+00	\N
67	23	15	4	PINK BRIGHT	H&M	58-312	\N	t	\N	2026-01-05 07:10:55.593516+00	\N
68	3	3	2	RED DARK	H&M	63-114	\N	t	\N	2026-01-05 07:10:55.658786+00	\N
69	3	3	1	RED MEDIUM DUSTY	H&M	52-104	\N	t	\N	2026-01-05 07:10:57.592931+00	\N
70	3	3	4	RED BRIGHT	H&M	50-117	\N	t	\N	2026-01-05 07:10:57.628501+00	\N
71	3	3	5	RED MEDIUM	H&M	48-305	\N	t	\N	2026-01-05 07:10:57.642794+00	\N
72	24	16	2	TURQUOISE DARK	H&M	93-116	\N	t	\N	2026-01-05 07:10:58.602579+00	\N
73	24	16	5	TURQUOISE MEDIUM	H&M	92-210	\N	t	\N	2026-01-05 07:10:58.617342+00	\N
74	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	92-101	\N	t	\N	2026-01-05 07:10:58.630605+00	\N
75	24	16	4	TURQUOISE BRIGHT	H&M	89-307	\N	t	\N	2026-01-05 07:10:58.644575+00	\N
76	24	16	6	TURQUOISE LIGHT	H&M	88-210	\N	t	\N	2026-01-05 07:10:58.664195+00	\N
77	24	16	3	TURQUOISE DUSTY LIGHT	H&M	88-208	\N	t	\N	2026-01-05 07:10:58.74515+00	\N
78	25	17	7	UNDEFINED UNDEFINED	H&M	90-106	\N	t	\N	2026-01-05 07:10:59.971726+00	\N
79	26	18	3	WHITE DUSTY LIGHT	H&M	87-115	\N	t	\N	2026-01-05 07:11:00.727648+00	\N
80	26	18	6	WHITE LIGHT	H&M	11-107	\N	t	\N	2026-01-05 07:11:00.745472+00	\N
81	26	18	4	WHITE BRIGHT	H&M	10-214	\N	t	\N	2026-01-05 07:11:00.885225+00	\N
82	27	19	4	YELLOW BRIGHT	H&M	97-313	\N	t	\N	2026-01-05 07:11:01.055868+00	\N
83	27	19	5	YELLOW MEDIUM	H&M	32-204	\N	t	\N	2026-01-05 07:11:01.067514+00	\N
84	27	19	6	YELLOW LIGHT	H&M	31-220	\N	t	\N	2026-01-05 07:11:01.092461+00	\N
85	27	19	3	YELLOW DUSTY LIGHT	H&M	31-203	\N	t	\N	2026-01-05 07:11:01.12256+00	\N
86	27	19	2	YELLOW DARK	H&M	29-313	\N	t	\N	2026-01-05 07:11:01.138111+00	\N
87	27	19	1	YELLOW MEDIUM DUSTY	H&M	28-211	\N	t	\N	2026-01-05 07:11:01.161717+00	\N
88	28	20	3	YELLOWISH GREEN DUSTY LIGHT	H&M	97-130	\N	t	\N	2026-01-05 07:11:02.61801+00	\N
89	28	20	4	YELLOWISH GREEN BRIGHT	H&M	90-109	\N	t	\N	2026-01-05 07:11:02.623869+00	\N
90	11	5	1	BEIGE MEDIUM DUSTY	H&M	39-105	\N	t	\N	2026-01-05 07:24:46.655152+00	\N
91	11	5	1	BEIGE MEDIUM DUSTY	H&M	35-109	\N	t	\N	2026-01-05 07:24:46.719301+00	\N
92	11	5	1	BEIGE MEDIUM DUSTY	H&M	35-108	\N	t	\N	2026-01-05 07:24:46.732341+00	\N
93	11	5	1	BEIGE MEDIUM DUSTY	H&M	35-102	\N	t	\N	2026-01-05 07:24:46.745269+00	\N
94	11	5	2	BEIGE DARK	H&M	35-101	\N	t	\N	2026-01-05 07:24:46.75947+00	\N
95	11	5	2	BEIGE DARK	H&M	33-105	\N	t	\N	2026-01-05 07:24:46.775303+00	\N
96	11	5	2	BEIGE DARK	H&M	33-103	\N	t	\N	2026-01-05 07:24:46.790467+00	\N
97	11	5	1	BEIGE MEDIUM DUSTY	H&M	28-102	\N	t	\N	2026-01-05 07:24:46.805348+00	\N
98	11	5	1	BEIGE MEDIUM DUSTY	H&M	28-101	\N	t	\N	2026-01-05 07:24:46.830456+00	\N
99	11	5	2	BEIGE DARK	H&M	26-206	\N	t	\N	2026-01-05 07:24:46.84302+00	\N
100	11	5	2	BEIGE DARK	H&M	26-205	\N	t	\N	2026-01-05 07:24:46.857463+00	\N
101	11	5	2	BEIGE DARK	H&M	26-201	\N	t	\N	2026-01-05 07:24:46.871649+00	\N
102	11	5	2	BEIGE DARK	H&M	26-101	\N	t	\N	2026-01-05 07:24:46.883955+00	\N
103	11	5	1	BEIGE MEDIUM DUSTY	H&M	25-102	\N	t	\N	2026-01-05 07:24:46.897241+00	\N
104	11	5	3	BEIGE DUSTY LIGHT	H&M	24-105	\N	t	\N	2026-01-05 07:24:46.9138+00	\N
105	11	5	3	BEIGE DUSTY LIGHT	H&M	24-103	\N	t	\N	2026-01-05 07:24:46.940023+00	\N
106	11	5	2	BEIGE DARK	H&M	23-201	\N	t	\N	2026-01-05 07:24:46.955451+00	\N
107	11	5	1	BEIGE MEDIUM DUSTY	H&M	22-215	\N	t	\N	2026-01-05 07:24:46.968602+00	\N
108	11	5	1	BEIGE MEDIUM DUSTY	H&M	22-209	\N	t	\N	2026-01-05 07:24:46.981533+00	\N
109	11	5	1	BEIGE MEDIUM DUSTY	H&M	22-201	\N	t	\N	2026-01-05 07:24:46.995708+00	\N
110	11	5	1	BEIGE MEDIUM DUSTY	H&M	22-106	\N	t	\N	2026-01-05 07:24:47.011918+00	\N
111	11	5	1	BEIGE MEDIUM DUSTY	H&M	22-103	\N	t	\N	2026-01-05 07:24:47.024112+00	\N
112	11	5	1	BEIGE MEDIUM DUSTY	H&M	22-102	\N	t	\N	2026-01-05 07:24:47.039618+00	\N
113	11	5	1	BEIGE MEDIUM DUSTY	H&M	19-313	\N	t	\N	2026-01-05 07:24:47.054741+00	\N
114	11	5	1	BEIGE MEDIUM DUSTY	H&M	19-311	\N	t	\N	2026-01-05 07:24:47.069448+00	\N
115	11	5	1	BEIGE MEDIUM DUSTY	H&M	19-309	\N	t	\N	2026-01-05 07:24:47.082959+00	\N
116	11	5	1	BEIGE MEDIUM DUSTY	H&M	19-307	\N	t	\N	2026-01-05 07:24:47.098491+00	\N
117	11	5	1	BEIGE MEDIUM DUSTY	H&M	19-302	\N	t	\N	2026-01-05 07:24:47.114337+00	\N
118	11	5	1	BEIGE MEDIUM DUSTY	H&M	19-301	\N	t	\N	2026-01-05 07:24:47.13445+00	\N
119	11	5	2	BEIGE DARK	H&M	19-218	\N	t	\N	2026-01-05 07:24:47.154593+00	\N
120	11	5	2	BEIGE DARK	H&M	18-328	\N	t	\N	2026-01-05 07:24:47.183689+00	\N
121	11	5	2	BEIGE DARK	H&M	18-301	\N	t	\N	2026-01-05 07:24:47.199099+00	\N
122	11	5	2	BEIGE DARK	H&M	18-122	\N	t	\N	2026-01-05 07:24:47.219932+00	\N
123	11	5	2	BEIGE DARK	H&M	16-237	\N	t	\N	2026-01-05 07:24:47.251949+00	\N
124	11	5	2	BEIGE DARK	H&M	16-112	\N	t	\N	2026-01-05 07:24:47.265257+00	\N
125	11	5	3	BEIGE DUSTY LIGHT	H&M	16-110	\N	t	\N	2026-01-05 07:24:47.276393+00	\N
126	11	5	1	BEIGE MEDIUM DUSTY	H&M	16-105	\N	t	\N	2026-01-05 07:24:47.291075+00	\N
127	11	5	1	BEIGE MEDIUM DUSTY	H&M	16-102	\N	t	\N	2026-01-05 07:24:47.307581+00	\N
128	11	5	2	BEIGE DARK	H&M	14-331	\N	t	\N	2026-01-05 07:24:47.321474+00	\N
129	11	5	2	BEIGE DARK	H&M	14-328	\N	t	\N	2026-01-05 07:24:47.332478+00	\N
130	11	5	2	BEIGE DARK	H&M	14-327	\N	t	\N	2026-01-05 07:24:47.346733+00	\N
131	11	5	2	BEIGE DARK	H&M	14-326	\N	t	\N	2026-01-05 07:24:47.35939+00	\N
132	11	5	2	BEIGE DARK	H&M	14-325	\N	t	\N	2026-01-05 07:24:47.37443+00	\N
133	11	5	2	BEIGE DARK	H&M	14-321	\N	t	\N	2026-01-05 07:24:47.390565+00	\N
134	11	5	2	BEIGE DARK	H&M	14-320	\N	t	\N	2026-01-05 07:24:47.408831+00	\N
135	11	5	2	BEIGE DARK	H&M	14-319	\N	t	\N	2026-01-05 07:24:47.424059+00	\N
136	11	5	1	BEIGE MEDIUM DUSTY	H&M	14-318	\N	t	\N	2026-01-05 07:24:47.439036+00	\N
137	11	5	2	BEIGE DARK	H&M	14-317	\N	t	\N	2026-01-05 07:24:47.453415+00	\N
138	11	5	2	BEIGE DARK	H&M	14-316	\N	t	\N	2026-01-05 07:24:47.46603+00	\N
139	11	5	2	BEIGE DARK	H&M	14-315	\N	t	\N	2026-01-05 07:24:47.479934+00	\N
140	11	5	1	BEIGE MEDIUM DUSTY	H&M	14-314	\N	t	\N	2026-01-05 07:24:47.492318+00	\N
141	11	5	2	BEIGE DARK	H&M	14-313	\N	t	\N	2026-01-05 07:24:47.507691+00	\N
142	11	5	2	BEIGE DARK	H&M	14-311	\N	t	\N	2026-01-05 07:24:47.522534+00	\N
143	11	5	2	BEIGE DARK	H&M	14-309	\N	t	\N	2026-01-05 07:24:47.536386+00	\N
144	11	5	2	BEIGE DARK	H&M	14-308	\N	t	\N	2026-01-05 07:24:47.548512+00	\N
145	11	5	1	BEIGE MEDIUM DUSTY	H&M	14-306	\N	t	\N	2026-01-05 07:24:47.560468+00	\N
146	11	5	2	BEIGE DARK	H&M	14-305	\N	t	\N	2026-01-05 07:24:47.574719+00	\N
147	11	5	2	BEIGE DARK	H&M	14-303	\N	t	\N	2026-01-05 07:24:47.590065+00	\N
148	11	5	2	BEIGE DARK	H&M	14-302	\N	t	\N	2026-01-05 07:24:47.604782+00	\N
149	11	5	2	BEIGE DARK	H&M	14-301	\N	t	\N	2026-01-05 07:24:47.617865+00	\N
150	11	5	2	BEIGE DARK	H&M	14-214	\N	t	\N	2026-01-05 07:24:47.630697+00	\N
151	11	5	1	BEIGE MEDIUM DUSTY	H&M	14-211	\N	t	\N	2026-01-05 07:24:47.645758+00	\N
152	11	5	2	BEIGE DARK	H&M	14-210	\N	t	\N	2026-01-05 07:24:47.663284+00	\N
153	11	5	2	BEIGE DARK	H&M	14-203	\N	t	\N	2026-01-05 07:24:47.679318+00	\N
154	11	5	2	BEIGE DARK	H&M	14-132	\N	t	\N	2026-01-05 07:24:47.696617+00	\N
155	11	5	1	BEIGE MEDIUM DUSTY	H&M	14-131	\N	t	\N	2026-01-05 07:24:47.711831+00	\N
156	11	5	2	BEIGE DARK	H&M	14-130	\N	t	\N	2026-01-05 07:24:47.726122+00	\N
157	11	5	2	BEIGE DARK	H&M	14-129	\N	t	\N	2026-01-05 07:24:47.742009+00	\N
158	11	5	2	BEIGE DARK	H&M	14-128	\N	t	\N	2026-01-05 07:24:47.759388+00	\N
159	11	5	2	BEIGE DARK	H&M	14-124	\N	t	\N	2026-01-05 07:24:47.776183+00	\N
160	11	5	2	BEIGE DARK	H&M	14-121	\N	t	\N	2026-01-05 07:24:47.792883+00	\N
161	11	5	2	BEIGE DARK	H&M	14-120	\N	t	\N	2026-01-05 07:24:47.814904+00	\N
162	11	5	2	BEIGE DARK	H&M	14-117	\N	t	\N	2026-01-05 07:24:47.831496+00	\N
163	11	5	2	BEIGE DARK	H&M	14-116	\N	t	\N	2026-01-05 07:24:47.848121+00	\N
164	11	5	2	BEIGE DARK	H&M	14-114	\N	t	\N	2026-01-05 07:24:47.864956+00	\N
165	11	5	2	BEIGE DARK	H&M	14-112	\N	t	\N	2026-01-05 07:24:47.882421+00	\N
166	11	5	2	BEIGE DARK	H&M	14-109	\N	t	\N	2026-01-05 07:24:47.898476+00	\N
167	11	5	2	BEIGE DARK	H&M	14-108	\N	t	\N	2026-01-05 07:24:47.913823+00	\N
168	11	5	2	BEIGE DARK	H&M	14-106	\N	t	\N	2026-01-05 07:24:47.932336+00	\N
169	11	5	2	BEIGE DARK	H&M	14-105	\N	t	\N	2026-01-05 07:24:47.946458+00	\N
170	11	5	2	BEIGE DARK	H&M	14-104	\N	t	\N	2026-01-05 07:24:47.958087+00	\N
171	11	5	2	BEIGE DARK	H&M	14-103	\N	t	\N	2026-01-05 07:24:47.973675+00	\N
172	11	5	2	BEIGE DARK	H&M	14-102	\N	t	\N	2026-01-05 07:24:47.988299+00	\N
173	11	5	2	BEIGE DARK	H&M	13-347	\N	t	\N	2026-01-05 07:24:47.999832+00	\N
174	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-346	\N	t	\N	2026-01-05 07:24:48.012756+00	\N
175	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-345	\N	t	\N	2026-01-05 07:24:48.024493+00	\N
176	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-344	\N	t	\N	2026-01-05 07:24:48.039123+00	\N
177	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-343	\N	t	\N	2026-01-05 07:24:48.053498+00	\N
178	11	5	2	BEIGE DARK	H&M	13-342	\N	t	\N	2026-01-05 07:24:48.065456+00	\N
179	11	5	2	BEIGE DARK	H&M	13-341	\N	t	\N	2026-01-05 07:24:48.079269+00	\N
180	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-340	\N	t	\N	2026-01-05 07:24:48.095746+00	\N
181	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-339	\N	t	\N	2026-01-05 07:24:48.108347+00	\N
182	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-338	\N	t	\N	2026-01-05 07:24:48.12365+00	\N
183	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-337	\N	t	\N	2026-01-05 07:24:48.139039+00	\N
184	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-336	\N	t	\N	2026-01-05 07:24:48.153771+00	\N
185	11	5	2	BEIGE DARK	H&M	13-335	\N	t	\N	2026-01-05 07:24:48.169644+00	\N
186	11	5	3	BEIGE DUSTY LIGHT	H&M	13-334	\N	t	\N	2026-01-05 07:24:48.196866+00	\N
187	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-333	\N	t	\N	2026-01-05 07:24:48.212258+00	\N
188	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-332	\N	t	\N	2026-01-05 07:24:48.22477+00	\N
189	11	5	2	BEIGE DARK	H&M	13-331	\N	t	\N	2026-01-05 07:24:48.239472+00	\N
190	11	5	2	BEIGE DARK	H&M	13-330	\N	t	\N	2026-01-05 07:24:48.255656+00	\N
191	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-329	\N	t	\N	2026-01-05 07:24:48.269846+00	\N
192	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-328	\N	t	\N	2026-01-05 07:24:48.281098+00	\N
193	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-327	\N	t	\N	2026-01-05 07:24:48.294534+00	\N
194	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-326	\N	t	\N	2026-01-05 07:24:48.307762+00	\N
195	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-325	\N	t	\N	2026-01-05 07:24:48.324032+00	\N
196	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-324	\N	t	\N	2026-01-05 07:24:48.339123+00	\N
197	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-323	\N	t	\N	2026-01-05 07:24:48.353715+00	\N
198	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-322	\N	t	\N	2026-01-05 07:24:48.366509+00	\N
199	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-321	\N	t	\N	2026-01-05 07:24:48.380615+00	\N
200	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-320	\N	t	\N	2026-01-05 07:24:48.389599+00	\N
201	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-319	\N	t	\N	2026-01-05 07:24:48.404599+00	\N
202	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-318	\N	t	\N	2026-01-05 07:24:48.417324+00	\N
203	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-317	\N	t	\N	2026-01-05 07:24:48.42999+00	\N
204	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-316	\N	t	\N	2026-01-05 07:24:48.44234+00	\N
205	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-315	\N	t	\N	2026-01-05 07:24:48.457497+00	\N
206	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-314	\N	t	\N	2026-01-05 07:24:48.472155+00	\N
207	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-313	\N	t	\N	2026-01-05 07:24:48.48581+00	\N
208	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-312	\N	t	\N	2026-01-05 07:24:48.498186+00	\N
209	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-311	\N	t	\N	2026-01-05 07:24:48.508172+00	\N
210	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-310	\N	t	\N	2026-01-05 07:24:48.522567+00	\N
211	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-309	\N	t	\N	2026-01-05 07:24:48.53735+00	\N
212	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-308	\N	t	\N	2026-01-05 07:24:48.549402+00	\N
213	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-307	\N	t	\N	2026-01-05 07:24:48.563159+00	\N
214	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-306	\N	t	\N	2026-01-05 07:24:48.5755+00	\N
215	11	5	2	BEIGE DARK	H&M	13-305	\N	t	\N	2026-01-05 07:24:48.590849+00	\N
216	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-304	\N	t	\N	2026-01-05 07:24:48.605518+00	\N
217	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-303	\N	t	\N	2026-01-05 07:24:48.619751+00	\N
218	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-302	\N	t	\N	2026-01-05 07:24:48.632262+00	\N
219	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-301	\N	t	\N	2026-01-05 07:24:48.646145+00	\N
220	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-241	\N	t	\N	2026-01-05 07:24:48.658425+00	\N
221	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-239	\N	t	\N	2026-01-05 07:24:48.67434+00	\N
222	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-238	\N	t	\N	2026-01-05 07:24:48.689912+00	\N
223	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-237	\N	t	\N	2026-01-05 07:24:48.703977+00	\N
224	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-236	\N	t	\N	2026-01-05 07:24:48.716664+00	\N
225	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-235	\N	t	\N	2026-01-05 07:24:48.730009+00	\N
226	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-234	\N	t	\N	2026-01-05 07:24:48.743725+00	\N
227	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-232	\N	t	\N	2026-01-05 07:24:48.757393+00	\N
228	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-231	\N	t	\N	2026-01-05 07:24:48.772092+00	\N
229	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-230	\N	t	\N	2026-01-05 07:24:48.786269+00	\N
230	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-228	\N	t	\N	2026-01-05 07:24:48.79897+00	\N
231	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-227	\N	t	\N	2026-01-05 07:24:48.812499+00	\N
232	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-226	\N	t	\N	2026-01-05 07:24:48.825174+00	\N
233	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-225	\N	t	\N	2026-01-05 07:24:48.840639+00	\N
234	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-222	\N	t	\N	2026-01-05 07:24:48.85634+00	\N
235	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-221	\N	t	\N	2026-01-05 07:24:48.87033+00	\N
236	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-220	\N	t	\N	2026-01-05 07:24:48.882444+00	\N
237	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-219	\N	t	\N	2026-01-05 07:24:48.89613+00	\N
238	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-218	\N	t	\N	2026-01-05 07:24:48.908105+00	\N
239	11	5	3	BEIGE DUSTY LIGHT	H&M	13-217	\N	t	\N	2026-01-05 07:24:48.923386+00	\N
240	11	5	3	BEIGE DUSTY LIGHT	H&M	13-216	\N	t	\N	2026-01-05 07:24:48.938652+00	\N
241	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-215	\N	t	\N	2026-01-05 07:24:48.952723+00	\N
242	11	5	3	BEIGE DUSTY LIGHT	H&M	13-214	\N	t	\N	2026-01-05 07:24:48.965401+00	\N
243	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-213	\N	t	\N	2026-01-05 07:24:48.979412+00	\N
244	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-212	\N	t	\N	2026-01-05 07:24:48.991824+00	\N
245	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-211	\N	t	\N	2026-01-05 07:24:49.006839+00	\N
246	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-210	\N	t	\N	2026-01-05 07:24:49.021645+00	\N
247	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-209	\N	t	\N	2026-01-05 07:24:49.036489+00	\N
248	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-208	\N	t	\N	2026-01-05 07:24:49.048999+00	\N
249	11	5	2	BEIGE DARK	H&M	13-207	\N	t	\N	2026-01-05 07:24:49.062581+00	\N
250	11	5	2	BEIGE DARK	H&M	13-206	\N	t	\N	2026-01-05 07:24:49.075065+00	\N
251	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-205	\N	t	\N	2026-01-05 07:24:49.090324+00	\N
252	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-204	\N	t	\N	2026-01-05 07:24:49.104919+00	\N
253	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-203	\N	t	\N	2026-01-05 07:24:49.118728+00	\N
254	11	5	2	BEIGE DARK	H&M	13-202	\N	t	\N	2026-01-05 07:24:49.131535+00	\N
255	11	5	2	BEIGE DARK	H&M	13-135	\N	t	\N	2026-01-05 07:24:49.146009+00	\N
256	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-134	\N	t	\N	2026-01-05 07:24:49.158001+00	\N
257	11	5	2	BEIGE DARK	H&M	13-133	\N	t	\N	2026-01-05 07:24:49.173829+00	\N
258	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-132	\N	t	\N	2026-01-05 07:24:49.189114+00	\N
259	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-131	\N	t	\N	2026-01-05 07:24:49.204021+00	\N
260	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-130	\N	t	\N	2026-01-05 07:24:49.217322+00	\N
261	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-129	\N	t	\N	2026-01-05 07:24:49.230061+00	\N
262	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-128	\N	t	\N	2026-01-05 07:24:49.242616+00	\N
263	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-127	\N	t	\N	2026-01-05 07:24:49.2575+00	\N
264	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-126	\N	t	\N	2026-01-05 07:24:49.273346+00	\N
265	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-125	\N	t	\N	2026-01-05 07:24:49.295681+00	\N
266	11	5	3	BEIGE DUSTY LIGHT	H&M	13-124	\N	t	\N	2026-01-05 07:24:49.308084+00	\N
267	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-123	\N	t	\N	2026-01-05 07:24:49.322743+00	\N
268	11	5	3	BEIGE DUSTY LIGHT	H&M	13-122	\N	t	\N	2026-01-05 07:24:49.337623+00	\N
269	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-121	\N	t	\N	2026-01-05 07:24:49.351137+00	\N
270	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-120	\N	t	\N	2026-01-05 07:24:49.364144+00	\N
271	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-119	\N	t	\N	2026-01-05 07:24:49.378697+00	\N
272	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-118	\N	t	\N	2026-01-05 07:24:49.391287+00	\N
273	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-117	\N	t	\N	2026-01-05 07:24:49.405906+00	\N
274	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-116	\N	t	\N	2026-01-05 07:24:49.420621+00	\N
275	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-115	\N	t	\N	2026-01-05 07:24:49.434011+00	\N
276	11	5	2	BEIGE DARK	H&M	13-114	\N	t	\N	2026-01-05 07:24:49.446192+00	\N
277	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-113	\N	t	\N	2026-01-05 07:24:49.458716+00	\N
278	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-112	\N	t	\N	2026-01-05 07:24:49.474703+00	\N
279	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-111	\N	t	\N	2026-01-05 07:24:49.489713+00	\N
280	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-110	\N	t	\N	2026-01-05 07:24:49.504906+00	\N
281	11	5	3	BEIGE DUSTY LIGHT	H&M	13-109	\N	t	\N	2026-01-05 07:24:49.518815+00	\N
282	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-108	\N	t	\N	2026-01-05 07:24:49.531044+00	\N
283	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-107	\N	t	\N	2026-01-05 07:24:49.545863+00	\N
284	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-106	\N	t	\N	2026-01-05 07:24:49.558769+00	\N
285	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-105	\N	t	\N	2026-01-05 07:24:49.573562+00	\N
286	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-104	\N	t	\N	2026-01-05 07:24:49.588256+00	\N
287	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-103	\N	t	\N	2026-01-05 07:24:49.602456+00	\N
288	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-102	\N	t	\N	2026-01-05 07:24:49.615116+00	\N
289	11	5	1	BEIGE MEDIUM DUSTY	H&M	13-101	\N	t	\N	2026-01-05 07:24:49.628841+00	\N
290	11	5	3	BEIGE DUSTY LIGHT	H&M	12-344	\N	t	\N	2026-01-05 07:24:49.641174+00	\N
291	11	5	3	BEIGE DUSTY LIGHT	H&M	12-342	\N	t	\N	2026-01-05 07:24:49.655761+00	\N
292	11	5	3	BEIGE DUSTY LIGHT	H&M	12-341	\N	t	\N	2026-01-05 07:24:49.670053+00	\N
293	11	5	1	BEIGE MEDIUM DUSTY	H&M	12-340	\N	t	\N	2026-01-05 07:24:49.68264+00	\N
294	11	5	3	BEIGE DUSTY LIGHT	H&M	12-339	\N	t	\N	2026-01-05 07:24:49.695711+00	\N
295	11	5	3	BEIGE DUSTY LIGHT	H&M	12-338	\N	t	\N	2026-01-05 07:24:49.708437+00	\N
296	11	5	3	BEIGE DUSTY LIGHT	H&M	12-337	\N	t	\N	2026-01-05 07:24:49.723021+00	\N
297	11	5	3	BEIGE DUSTY LIGHT	H&M	12-336	\N	t	\N	2026-01-05 07:24:49.737869+00	\N
298	11	5	3	BEIGE DUSTY LIGHT	H&M	12-335	\N	t	\N	2026-01-05 07:24:49.753641+00	\N
299	11	5	3	BEIGE DUSTY LIGHT	H&M	12-334	\N	t	\N	2026-01-05 07:24:49.765972+00	\N
300	11	5	3	BEIGE DUSTY LIGHT	H&M	12-333	\N	t	\N	2026-01-05 07:24:49.780611+00	\N
301	11	5	3	BEIGE DUSTY LIGHT	H&M	12-332	\N	t	\N	2026-01-05 07:24:49.797382+00	\N
302	11	5	3	BEIGE DUSTY LIGHT	H&M	12-331	\N	t	\N	2026-01-05 07:24:49.814621+00	\N
303	11	5	3	BEIGE DUSTY LIGHT	H&M	12-330	\N	t	\N	2026-01-05 07:24:49.832107+00	\N
304	11	5	3	BEIGE DUSTY LIGHT	H&M	12-329	\N	t	\N	2026-01-05 07:24:49.845871+00	\N
305	11	5	3	BEIGE DUSTY LIGHT	H&M	12-328	\N	t	\N	2026-01-05 07:24:49.861555+00	\N
306	11	5	3	BEIGE DUSTY LIGHT	H&M	12-327	\N	t	\N	2026-01-05 07:24:49.878557+00	\N
307	11	5	3	BEIGE DUSTY LIGHT	H&M	12-326	\N	t	\N	2026-01-05 07:24:49.892809+00	\N
308	11	5	3	BEIGE DUSTY LIGHT	H&M	12-325	\N	t	\N	2026-01-05 07:24:49.911644+00	\N
309	11	5	3	BEIGE DUSTY LIGHT	H&M	12-324	\N	t	\N	2026-01-05 07:24:49.927753+00	\N
310	11	5	3	BEIGE DUSTY LIGHT	H&M	12-323	\N	t	\N	2026-01-05 07:24:49.941253+00	\N
311	11	5	3	BEIGE DUSTY LIGHT	H&M	12-322	\N	t	\N	2026-01-05 07:24:49.957048+00	\N
312	11	5	3	BEIGE DUSTY LIGHT	H&M	12-321	\N	t	\N	2026-01-05 07:24:49.972765+00	\N
313	11	5	3	BEIGE DUSTY LIGHT	H&M	12-320	\N	t	\N	2026-01-05 07:24:49.986837+00	\N
314	11	5	3	BEIGE DUSTY LIGHT	H&M	12-319	\N	t	\N	2026-01-05 07:24:49.999206+00	\N
315	11	5	3	BEIGE DUSTY LIGHT	H&M	12-318	\N	t	\N	2026-01-05 07:24:50.012488+00	\N
316	11	5	3	BEIGE DUSTY LIGHT	H&M	12-317	\N	t	\N	2026-01-05 07:24:50.025033+00	\N
317	11	5	3	BEIGE DUSTY LIGHT	H&M	12-316	\N	t	\N	2026-01-05 07:24:50.040563+00	\N
318	11	5	3	BEIGE DUSTY LIGHT	H&M	12-315	\N	t	\N	2026-01-05 07:24:50.05705+00	\N
319	11	5	3	BEIGE DUSTY LIGHT	H&M	12-314	\N	t	\N	2026-01-05 07:24:50.074188+00	\N
320	11	5	3	BEIGE DUSTY LIGHT	H&M	12-313	\N	t	\N	2026-01-05 07:24:50.090772+00	\N
321	11	5	1	BEIGE MEDIUM DUSTY	H&M	12-312	\N	t	\N	2026-01-05 07:24:50.107118+00	\N
322	11	5	3	BEIGE DUSTY LIGHT	H&M	12-311	\N	t	\N	2026-01-05 07:24:50.12302+00	\N
323	11	5	3	BEIGE DUSTY LIGHT	H&M	12-310	\N	t	\N	2026-01-05 07:24:50.136711+00	\N
324	11	5	3	BEIGE DUSTY LIGHT	H&M	12-309	\N	t	\N	2026-01-05 07:24:50.148963+00	\N
325	11	5	3	BEIGE DUSTY LIGHT	H&M	12-308	\N	t	\N	2026-01-05 07:24:50.162327+00	\N
326	11	5	3	BEIGE DUSTY LIGHT	H&M	12-307	\N	t	\N	2026-01-05 07:24:50.17802+00	\N
327	11	5	3	BEIGE DUSTY LIGHT	H&M	12-306	\N	t	\N	2026-01-05 07:24:50.195458+00	\N
328	11	5	3	BEIGE DUSTY LIGHT	H&M	12-305	\N	t	\N	2026-01-05 07:24:50.210058+00	\N
329	11	5	3	BEIGE DUSTY LIGHT	H&M	12-304	\N	t	\N	2026-01-05 07:24:50.232123+00	\N
330	11	5	3	BEIGE DUSTY LIGHT	H&M	12-303	\N	t	\N	2026-01-05 07:24:50.245699+00	\N
331	11	5	3	BEIGE DUSTY LIGHT	H&M	12-302	\N	t	\N	2026-01-05 07:24:50.259447+00	\N
332	11	5	3	BEIGE DUSTY LIGHT	H&M	12-301	\N	t	\N	2026-01-05 07:24:50.273934+00	\N
333	11	5	3	BEIGE DUSTY LIGHT	H&M	12-236	\N	t	\N	2026-01-05 07:24:50.28892+00	\N
334	11	5	3	BEIGE DUSTY LIGHT	H&M	12-234	\N	t	\N	2026-01-05 07:24:50.303893+00	\N
335	11	5	3	BEIGE DUSTY LIGHT	H&M	12-233	\N	t	\N	2026-01-05 07:24:50.317873+00	\N
336	11	5	3	BEIGE DUSTY LIGHT	H&M	12-232	\N	t	\N	2026-01-05 07:24:50.330533+00	\N
337	11	5	3	BEIGE DUSTY LIGHT	H&M	12-230	\N	t	\N	2026-01-05 07:24:50.343754+00	\N
338	11	5	3	BEIGE DUSTY LIGHT	H&M	12-228	\N	t	\N	2026-01-05 07:24:50.356578+00	\N
339	11	5	3	BEIGE DUSTY LIGHT	H&M	12-226	\N	t	\N	2026-01-05 07:24:50.371226+00	\N
340	11	5	3	BEIGE DUSTY LIGHT	H&M	12-225	\N	t	\N	2026-01-05 07:24:50.385435+00	\N
341	11	5	3	BEIGE DUSTY LIGHT	H&M	12-224	\N	t	\N	2026-01-05 07:24:50.39823+00	\N
342	11	5	3	BEIGE DUSTY LIGHT	H&M	12-223	\N	t	\N	2026-01-05 07:24:50.412584+00	\N
343	11	5	3	BEIGE DUSTY LIGHT	H&M	12-222	\N	t	\N	2026-01-05 07:24:50.425675+00	\N
344	11	5	3	BEIGE DUSTY LIGHT	H&M	12-221	\N	t	\N	2026-01-05 07:24:50.440967+00	\N
345	11	5	3	BEIGE DUSTY LIGHT	H&M	12-218	\N	t	\N	2026-01-05 07:24:50.455393+00	\N
346	11	5	3	BEIGE DUSTY LIGHT	H&M	12-217	\N	t	\N	2026-01-05 07:24:50.46954+00	\N
347	11	5	3	BEIGE DUSTY LIGHT	H&M	12-216	\N	t	\N	2026-01-05 07:24:50.48285+00	\N
348	11	5	3	BEIGE DUSTY LIGHT	H&M	12-215	\N	t	\N	2026-01-05 07:24:50.490584+00	\N
349	11	5	3	BEIGE DUSTY LIGHT	H&M	12-212	\N	t	\N	2026-01-05 07:24:50.501094+00	\N
350	11	5	3	BEIGE DUSTY LIGHT	H&M	12-211	\N	t	\N	2026-01-05 07:24:50.508113+00	\N
351	11	5	3	BEIGE DUSTY LIGHT	H&M	12-209	\N	t	\N	2026-01-05 07:24:50.51829+00	\N
352	11	5	3	BEIGE DUSTY LIGHT	H&M	12-206	\N	t	\N	2026-01-05 07:24:50.526451+00	\N
353	11	5	3	BEIGE DUSTY LIGHT	H&M	12-204	\N	t	\N	2026-01-05 07:24:50.535253+00	\N
354	11	5	1	BEIGE MEDIUM DUSTY	H&M	12-203	\N	t	\N	2026-01-05 07:24:50.544462+00	\N
355	11	5	3	BEIGE DUSTY LIGHT	H&M	12-202	\N	t	\N	2026-01-05 07:24:50.552322+00	\N
356	11	5	3	BEIGE DUSTY LIGHT	H&M	12-145	\N	t	\N	2026-01-05 07:24:50.561254+00	\N
357	11	5	3	BEIGE DUSTY LIGHT	H&M	12-144	\N	t	\N	2026-01-05 07:24:50.568829+00	\N
358	11	5	3	BEIGE DUSTY LIGHT	H&M	12-143	\N	t	\N	2026-01-05 07:24:50.577709+00	\N
359	11	5	3	BEIGE DUSTY LIGHT	H&M	12-142	\N	t	\N	2026-01-05 07:24:50.585451+00	\N
360	11	5	3	BEIGE DUSTY LIGHT	H&M	12-141	\N	t	\N	2026-01-05 07:24:50.594749+00	\N
361	11	5	3	BEIGE DUSTY LIGHT	H&M	12-140	\N	t	\N	2026-01-05 07:24:50.603092+00	\N
362	11	5	3	BEIGE DUSTY LIGHT	H&M	12-139	\N	t	\N	2026-01-05 07:24:50.61197+00	\N
363	11	5	3	BEIGE DUSTY LIGHT	H&M	12-138	\N	t	\N	2026-01-05 07:24:50.619624+00	\N
364	11	5	3	BEIGE DUSTY LIGHT	H&M	12-137	\N	t	\N	2026-01-05 07:24:50.628192+00	\N
365	11	5	3	BEIGE DUSTY LIGHT	H&M	12-135	\N	t	\N	2026-01-05 07:24:50.635966+00	\N
366	11	5	3	BEIGE DUSTY LIGHT	H&M	12-134	\N	t	\N	2026-01-05 07:24:50.644932+00	\N
367	11	5	3	BEIGE DUSTY LIGHT	H&M	12-133	\N	t	\N	2026-01-05 07:24:50.652497+00	\N
368	11	5	3	BEIGE DUSTY LIGHT	H&M	12-132	\N	t	\N	2026-01-05 07:24:50.66129+00	\N
369	11	5	3	BEIGE DUSTY LIGHT	H&M	12-131	\N	t	\N	2026-01-05 07:24:50.668551+00	\N
370	11	5	3	BEIGE DUSTY LIGHT	H&M	12-129	\N	t	\N	2026-01-05 07:24:50.676961+00	\N
371	11	5	3	BEIGE DUSTY LIGHT	H&M	12-127	\N	t	\N	2026-01-05 07:24:50.684995+00	\N
372	11	5	3	BEIGE DUSTY LIGHT	H&M	12-126	\N	t	\N	2026-01-05 07:24:50.693141+00	\N
373	11	5	1	BEIGE MEDIUM DUSTY	H&M	12-125	\N	t	\N	2026-01-05 07:24:50.701465+00	\N
374	11	5	3	BEIGE DUSTY LIGHT	H&M	12-124	\N	t	\N	2026-01-05 07:24:50.708952+00	\N
375	11	5	3	BEIGE DUSTY LIGHT	H&M	12-123	\N	t	\N	2026-01-05 07:24:50.718039+00	\N
376	11	5	3	BEIGE DUSTY LIGHT	H&M	12-122	\N	t	\N	2026-01-05 07:24:50.725749+00	\N
377	11	5	3	BEIGE DUSTY LIGHT	H&M	12-120	\N	t	\N	2026-01-05 07:24:50.735069+00	\N
378	11	5	3	BEIGE DUSTY LIGHT	H&M	12-119	\N	t	\N	2026-01-05 07:24:50.744394+00	\N
379	11	5	3	BEIGE DUSTY LIGHT	H&M	12-118	\N	t	\N	2026-01-05 07:24:50.751715+00	\N
380	11	5	3	BEIGE DUSTY LIGHT	H&M	12-117	\N	t	\N	2026-01-05 07:24:50.762017+00	\N
381	11	5	3	BEIGE DUSTY LIGHT	H&M	12-116	\N	t	\N	2026-01-05 07:24:50.770437+00	\N
382	11	5	3	BEIGE DUSTY LIGHT	H&M	12-115	\N	t	\N	2026-01-05 07:24:50.781186+00	\N
383	11	5	3	BEIGE DUSTY LIGHT	H&M	12-112	\N	t	\N	2026-01-05 07:24:50.789054+00	\N
384	11	5	1	BEIGE MEDIUM DUSTY	H&M	12-111	\N	t	\N	2026-01-05 07:24:50.799552+00	\N
385	11	5	1	BEIGE MEDIUM DUSTY	H&M	12-110	\N	t	\N	2026-01-05 07:24:50.80641+00	\N
386	11	5	3	BEIGE DUSTY LIGHT	H&M	12-109	\N	t	\N	2026-01-05 07:24:50.816342+00	\N
387	11	5	3	BEIGE DUSTY LIGHT	H&M	12-108	\N	t	\N	2026-01-05 07:24:50.823212+00	\N
388	11	5	3	BEIGE DUSTY LIGHT	H&M	12-107	\N	t	\N	2026-01-05 07:24:50.832915+00	\N
389	11	5	1	BEIGE MEDIUM DUSTY	H&M	12-105	\N	t	\N	2026-01-05 07:24:50.839708+00	\N
390	11	5	3	BEIGE DUSTY LIGHT	H&M	12-104	\N	t	\N	2026-01-05 07:24:50.849507+00	\N
391	11	5	1	BEIGE MEDIUM DUSTY	H&M	12-103	\N	t	\N	2026-01-05 07:24:50.856503+00	\N
392	11	5	3	BEIGE DUSTY LIGHT	H&M	12-102	\N	t	\N	2026-01-05 07:24:50.866295+00	\N
393	11	5	3	BEIGE DUSTY LIGHT	H&M	12-101	\N	t	\N	2026-01-05 07:24:50.873203+00	\N
394	11	5	1	BEIGE MEDIUM DUSTY	H&M	07-233	\N	t	\N	2026-01-05 07:24:50.883398+00	\N
395	11	5	3	BEIGE DUSTY LIGHT	H&M	06-199	\N	t	\N	2026-01-05 07:24:50.890579+00	\N
396	12	6	2	BLACK DARK	H&M	09-110	\N	t	\N	2026-01-05 07:24:50.90042+00	\N
397	12	6	2	BLACK DARK	H&M	09-109	\N	t	\N	2026-01-05 07:24:50.908062+00	\N
398	12	6	2	BLACK DARK	H&M	09-108	\N	t	\N	2026-01-05 07:24:50.918056+00	\N
399	12	6	2	BLACK DARK	H&M	09-107	\N	t	\N	2026-01-05 07:24:50.925963+00	\N
400	12	6	2	BLACK DARK	H&M	09-106	\N	t	\N	2026-01-05 07:24:50.934964+00	\N
401	12	6	2	BLACK DARK	H&M	09-105	\N	t	\N	2026-01-05 07:24:50.944264+00	\N
402	12	6	2	BLACK DARK	H&M	09-104	\N	t	\N	2026-01-05 07:24:50.953053+00	\N
403	12	6	2	BLACK DARK	H&M	09-103	\N	t	\N	2026-01-05 07:24:50.961289+00	\N
404	12	6	2	BLACK DARK	H&M	09-101	\N	t	\N	2026-01-05 07:24:50.96909+00	\N
405	12	6	2	BLACK DARK	H&M	09-090	\N	t	\N	2026-01-05 07:24:50.977658+00	\N
406	12	6	2	BLACK DARK	H&M	08-304	\N	t	\N	2026-01-05 07:24:50.985138+00	\N
407	12	6	2	BLACK DARK	H&M	08-220	\N	t	\N	2026-01-05 07:24:50.993312+00	\N
408	12	6	2	BLACK DARK	H&M	08-205	\N	t	\N	2026-01-05 07:24:51.001557+00	\N
409	12	6	2	BLACK DARK	H&M	08-203	\N	t	\N	2026-01-05 07:24:51.009974+00	\N
410	13	1	1	BLUE MEDIUM DUSTY	H&M	82-107	\N	t	\N	2026-01-05 07:24:51.018011+00	\N
411	13	1	3	BLUE DUSTY LIGHT	H&M	82-105	\N	t	\N	2026-01-05 07:24:51.028225+00	\N
412	13	1	3	BLUE DUSTY LIGHT	H&M	81-107	\N	t	\N	2026-01-05 07:24:51.035844+00	\N
413	13	1	3	BLUE DUSTY LIGHT	H&M	81-106	\N	t	\N	2026-01-05 07:24:51.04466+00	\N
414	13	1	3	BLUE DUSTY LIGHT	H&M	81-104	\N	t	\N	2026-01-05 07:24:51.052093+00	\N
415	13	1	3	BLUE DUSTY LIGHT	H&M	81-103	\N	t	\N	2026-01-05 07:24:51.060366+00	\N
416	13	1	4	BLUE BRIGHT	H&M	79-304	\N	t	\N	2026-01-05 07:24:51.068272+00	\N
417	13	1	4	BLUE BRIGHT	H&M	79-303	\N	t	\N	2026-01-05 07:24:51.077684+00	\N
418	13	1	4	BLUE BRIGHT	H&M	79-302	\N	t	\N	2026-01-05 07:24:51.0853+00	\N
419	13	1	2	BLUE DARK	H&M	79-223	\N	t	\N	2026-01-05 07:24:51.094353+00	\N
420	13	1	2	BLUE DARK	H&M	79-221	\N	t	\N	2026-01-05 07:24:51.10285+00	\N
421	13	1	2	BLUE DARK	H&M	79-220	\N	t	\N	2026-01-05 07:24:51.111234+00	\N
422	13	1	2	BLUE DARK	H&M	79-217	\N	t	\N	2026-01-05 07:24:51.119005+00	\N
423	13	1	5	BLUE MEDIUM	H&M	79-216	\N	t	\N	2026-01-05 07:24:51.127891+00	\N
424	13	1	1	BLUE MEDIUM DUSTY	H&M	79-214	\N	t	\N	2026-01-05 07:24:51.135815+00	\N
425	13	1	5	BLUE MEDIUM	H&M	79-213	\N	t	\N	2026-01-05 07:24:51.1444+00	\N
426	13	1	5	BLUE MEDIUM	H&M	79-212	\N	t	\N	2026-01-05 07:24:51.151896+00	\N
427	13	1	5	BLUE MEDIUM	H&M	79-211	\N	t	\N	2026-01-05 07:24:51.161072+00	\N
428	13	1	1	BLUE MEDIUM DUSTY	H&M	79-210	\N	t	\N	2026-01-05 07:24:51.168651+00	\N
429	13	1	1	BLUE MEDIUM DUSTY	H&M	79-209	\N	t	\N	2026-01-05 07:24:51.178068+00	\N
430	13	1	1	BLUE MEDIUM DUSTY	H&M	79-208	\N	t	\N	2026-01-05 07:24:51.18581+00	\N
431	13	1	5	BLUE MEDIUM	H&M	79-205	\N	t	\N	2026-01-05 07:24:51.194567+00	\N
432	13	1	1	BLUE MEDIUM DUSTY	H&M	79-204	\N	t	\N	2026-01-05 07:24:51.202098+00	\N
433	13	1	1	BLUE MEDIUM DUSTY	H&M	79-203	\N	t	\N	2026-01-05 07:24:51.210997+00	\N
434	13	1	1	BLUE MEDIUM DUSTY	H&M	79-202	\N	t	\N	2026-01-05 07:24:51.218619+00	\N
435	13	1	1	BLUE MEDIUM DUSTY	H&M	79-124	\N	t	\N	2026-01-05 07:24:51.227491+00	\N
436	13	1	2	BLUE DARK	H&M	79-123	\N	t	\N	2026-01-05 07:24:51.235068+00	\N
437	13	1	1	BLUE MEDIUM DUSTY	H&M	79-122	\N	t	\N	2026-01-05 07:24:51.244511+00	\N
438	13	1	2	BLUE DARK	H&M	79-120	\N	t	\N	2026-01-05 07:24:51.251937+00	\N
439	13	1	1	BLUE MEDIUM DUSTY	H&M	79-119	\N	t	\N	2026-01-05 07:24:51.260825+00	\N
440	13	1	2	BLUE DARK	H&M	79-118	\N	t	\N	2026-01-05 07:24:51.268333+00	\N
441	13	1	2	BLUE DARK	H&M	79-117	\N	t	\N	2026-01-05 07:24:51.277738+00	\N
442	13	1	2	BLUE DARK	H&M	79-116	\N	t	\N	2026-01-05 07:24:51.285362+00	\N
443	13	1	1	BLUE MEDIUM DUSTY	H&M	79-115	\N	t	\N	2026-01-05 07:24:51.294506+00	\N
444	13	1	1	BLUE MEDIUM DUSTY	H&M	79-112	\N	t	\N	2026-01-05 07:24:51.30285+00	\N
445	13	1	1	BLUE MEDIUM DUSTY	H&M	79-111	\N	t	\N	2026-01-05 07:24:51.311894+00	\N
446	13	1	1	BLUE MEDIUM DUSTY	H&M	79-110	\N	t	\N	2026-01-05 07:24:51.319778+00	\N
447	13	1	1	BLUE MEDIUM DUSTY	H&M	79-109	\N	t	\N	2026-01-05 07:24:51.328285+00	\N
448	13	1	1	BLUE MEDIUM DUSTY	H&M	79-108	\N	t	\N	2026-01-05 07:24:51.336105+00	\N
449	13	1	1	BLUE MEDIUM DUSTY	H&M	79-106	\N	t	\N	2026-01-05 07:24:51.34505+00	\N
450	13	1	2	BLUE DARK	H&M	79-105	\N	t	\N	2026-01-05 07:24:51.35288+00	\N
451	13	1	2	BLUE DARK	H&M	79-104	\N	t	\N	2026-01-05 07:24:51.361132+00	\N
452	13	1	2	BLUE DARK	H&M	79-103	\N	t	\N	2026-01-05 07:24:51.368888+00	\N
453	13	1	1	BLUE MEDIUM DUSTY	H&M	79-102	\N	t	\N	2026-01-05 07:24:51.377789+00	\N
454	13	1	5	BLUE MEDIUM	H&M	78-317	\N	t	\N	2026-01-05 07:24:51.385828+00	\N
455	13	1	4	BLUE BRIGHT	H&M	78-316	\N	t	\N	2026-01-05 07:24:51.394528+00	\N
456	13	1	4	BLUE BRIGHT	H&M	78-315	\N	t	\N	2026-01-05 07:24:51.402392+00	\N
457	13	1	4	BLUE BRIGHT	H&M	78-314	\N	t	\N	2026-01-05 07:24:51.411079+00	\N
458	13	1	4	BLUE BRIGHT	H&M	78-312	\N	t	\N	2026-01-05 07:24:51.418904+00	\N
459	13	1	4	BLUE BRIGHT	H&M	78-311	\N	t	\N	2026-01-05 07:24:51.427613+00	\N
460	13	1	4	BLUE BRIGHT	H&M	78-310	\N	t	\N	2026-01-05 07:24:51.435222+00	\N
461	13	1	4	BLUE BRIGHT	H&M	78-309	\N	t	\N	2026-01-05 07:24:51.444156+00	\N
462	13	1	4	BLUE BRIGHT	H&M	78-307	\N	t	\N	2026-01-05 07:24:51.45178+00	\N
463	13	1	4	BLUE BRIGHT	H&M	78-306	\N	t	\N	2026-01-05 07:24:51.461306+00	\N
464	13	1	4	BLUE BRIGHT	H&M	78-305	\N	t	\N	2026-01-05 07:24:51.469487+00	\N
465	13	1	4	BLUE BRIGHT	H&M	78-304	\N	t	\N	2026-01-05 07:24:51.478152+00	\N
466	13	1	4	BLUE BRIGHT	H&M	78-301	\N	t	\N	2026-01-05 07:24:51.486427+00	\N
467	13	1	1	BLUE MEDIUM DUSTY	H&M	78-217	\N	t	\N	2026-01-05 07:24:51.495349+00	\N
468	13	1	3	BLUE DUSTY LIGHT	H&M	78-216	\N	t	\N	2026-01-05 07:24:51.502844+00	\N
469	13	1	5	BLUE MEDIUM	H&M	78-215	\N	t	\N	2026-01-05 07:24:51.511346+00	\N
470	13	1	5	BLUE MEDIUM	H&M	78-214	\N	t	\N	2026-01-05 07:24:51.519142+00	\N
471	13	1	5	BLUE MEDIUM	H&M	78-213	\N	t	\N	2026-01-05 07:24:51.528364+00	\N
472	13	1	1	BLUE MEDIUM DUSTY	H&M	78-212	\N	t	\N	2026-01-05 07:24:51.536358+00	\N
473	13	1	1	BLUE MEDIUM DUSTY	H&M	78-211	\N	t	\N	2026-01-05 07:24:51.547089+00	\N
474	13	1	5	BLUE MEDIUM	H&M	78-208	\N	t	\N	2026-01-05 07:24:51.55414+00	\N
475	13	1	5	BLUE MEDIUM	H&M	78-207	\N	t	\N	2026-01-05 07:24:51.565688+00	\N
476	13	1	5	BLUE MEDIUM	H&M	78-206	\N	t	\N	2026-01-05 07:24:51.573128+00	\N
477	13	1	5	BLUE MEDIUM	H&M	78-205	\N	t	\N	2026-01-05 07:24:51.584606+00	\N
478	13	1	5	BLUE MEDIUM	H&M	78-204	\N	t	\N	2026-01-05 07:24:51.593503+00	\N
479	13	1	6	BLUE LIGHT	H&M	78-203	\N	t	\N	2026-01-05 07:24:51.601253+00	\N
480	13	1	3	BLUE DUSTY LIGHT	H&M	78-201	\N	t	\N	2026-01-05 07:24:51.608578+00	\N
481	13	1	3	BLUE DUSTY LIGHT	H&M	78-108	\N	t	\N	2026-01-05 07:24:51.61782+00	\N
482	13	1	3	BLUE DUSTY LIGHT	H&M	78-107	\N	t	\N	2026-01-05 07:24:51.625794+00	\N
483	13	1	1	BLUE MEDIUM DUSTY	H&M	78-106	\N	t	\N	2026-01-05 07:24:51.634484+00	\N
484	13	1	3	BLUE DUSTY LIGHT	H&M	78-105	\N	t	\N	2026-01-05 07:24:51.643465+00	\N
485	13	1	3	BLUE DUSTY LIGHT	H&M	78-104	\N	t	\N	2026-01-05 07:24:51.652016+00	\N
486	13	1	1	BLUE MEDIUM DUSTY	H&M	78-103	\N	t	\N	2026-01-05 07:24:51.661292+00	\N
487	13	1	1	BLUE MEDIUM DUSTY	H&M	78-102	\N	t	\N	2026-01-05 07:24:51.669787+00	\N
488	13	1	1	BLUE MEDIUM DUSTY	H&M	78-101	\N	t	\N	2026-01-05 07:24:51.679417+00	\N
489	13	1	6	BLUE LIGHT	H&M	77-306	\N	t	\N	2026-01-05 07:24:51.686548+00	\N
490	13	1	6	BLUE LIGHT	H&M	77-304	\N	t	\N	2026-01-05 07:24:51.695409+00	\N
491	13	1	6	BLUE LIGHT	H&M	77-303	\N	t	\N	2026-01-05 07:24:51.702811+00	\N
492	13	1	6	BLUE LIGHT	H&M	77-302	\N	t	\N	2026-01-05 07:24:51.711205+00	\N
493	13	1	6	BLUE LIGHT	H&M	77-214	\N	t	\N	2026-01-05 07:24:51.718893+00	\N
494	13	1	6	BLUE LIGHT	H&M	77-213	\N	t	\N	2026-01-05 07:24:51.727682+00	\N
495	13	1	6	BLUE LIGHT	H&M	77-212	\N	t	\N	2026-01-05 07:24:51.735543+00	\N
496	13	1	6	BLUE LIGHT	H&M	77-211	\N	t	\N	2026-01-05 07:24:51.744198+00	\N
497	13	1	6	BLUE LIGHT	H&M	77-210	\N	t	\N	2026-01-05 07:24:51.751582+00	\N
498	13	1	6	BLUE LIGHT	H&M	77-209	\N	t	\N	2026-01-05 07:24:51.760702+00	\N
499	13	1	6	BLUE LIGHT	H&M	77-208	\N	t	\N	2026-01-05 07:24:51.768413+00	\N
500	13	1	3	BLUE DUSTY LIGHT	H&M	77-207	\N	t	\N	2026-01-05 07:24:51.777174+00	\N
501	13	1	6	BLUE LIGHT	H&M	77-206	\N	t	\N	2026-01-05 07:24:51.784707+00	\N
502	13	1	6	BLUE LIGHT	H&M	77-205	\N	t	\N	2026-01-05 07:24:51.793097+00	\N
503	13	1	6	BLUE LIGHT	H&M	77-204	\N	t	\N	2026-01-05 07:24:51.800951+00	\N
504	13	1	6	BLUE LIGHT	H&M	77-203	\N	t	\N	2026-01-05 07:24:51.809943+00	\N
505	13	1	6	BLUE LIGHT	H&M	77-202	\N	t	\N	2026-01-05 07:24:51.819894+00	\N
506	13	1	6	BLUE LIGHT	H&M	77-201	\N	t	\N	2026-01-05 07:24:51.829012+00	\N
507	13	1	6	BLUE LIGHT	H&M	77-112	\N	t	\N	2026-01-05 07:24:51.837259+00	\N
508	13	1	3	BLUE DUSTY LIGHT	H&M	77-111	\N	t	\N	2026-01-05 07:24:51.849171+00	\N
509	13	1	3	BLUE DUSTY LIGHT	H&M	77-110	\N	t	\N	2026-01-05 07:24:51.856673+00	\N
510	13	1	3	BLUE DUSTY LIGHT	H&M	77-109	\N	t	\N	2026-01-05 07:24:51.867943+00	\N
511	13	1	3	BLUE DUSTY LIGHT	H&M	77-108	\N	t	\N	2026-01-05 07:24:51.87781+00	\N
512	13	1	6	BLUE LIGHT	H&M	77-107	\N	t	\N	2026-01-05 07:24:51.885826+00	\N
513	13	1	6	BLUE LIGHT	H&M	77-106	\N	t	\N	2026-01-05 07:24:51.894834+00	\N
514	13	1	6	BLUE LIGHT	H&M	77-105	\N	t	\N	2026-01-05 07:24:51.90422+00	\N
515	13	1	3	BLUE DUSTY LIGHT	H&M	77-104	\N	t	\N	2026-01-05 07:24:51.913653+00	\N
516	13	1	3	BLUE DUSTY LIGHT	H&M	77-103	\N	t	\N	2026-01-05 07:24:51.920691+00	\N
517	13	1	3	BLUE DUSTY LIGHT	H&M	77-102	\N	t	\N	2026-01-05 07:24:51.931625+00	\N
518	13	1	3	BLUE DUSTY LIGHT	H&M	77-101	\N	t	\N	2026-01-05 07:24:51.93902+00	\N
519	13	1	2	BLUE DARK	H&M	76-342	\N	t	\N	2026-01-05 07:24:51.948992+00	\N
520	13	1	2	BLUE DARK	H&M	76-341	\N	t	\N	2026-01-05 07:24:51.956004+00	\N
521	13	1	2	BLUE DARK	H&M	76-340	\N	t	\N	2026-01-05 07:24:51.96603+00	\N
522	13	1	5	BLUE MEDIUM	H&M	76-339	\N	t	\N	2026-01-05 07:24:51.972893+00	\N
523	13	1	5	BLUE MEDIUM	H&M	76-338	\N	t	\N	2026-01-05 07:24:51.982709+00	\N
524	13	1	4	BLUE BRIGHT	H&M	76-337	\N	t	\N	2026-01-05 07:24:51.989762+00	\N
525	13	1	4	BLUE BRIGHT	H&M	76-336	\N	t	\N	2026-01-05 07:24:52.000006+00	\N
526	13	1	2	BLUE DARK	H&M	76-335	\N	t	\N	2026-01-05 07:24:52.007469+00	\N
527	13	1	5	BLUE MEDIUM	H&M	76-334	\N	t	\N	2026-01-05 07:24:52.016506+00	\N
528	13	1	5	BLUE MEDIUM	H&M	76-333	\N	t	\N	2026-01-05 07:24:52.022049+00	\N
529	13	1	4	BLUE BRIGHT	H&M	76-332	\N	t	\N	2026-01-05 07:24:52.031067+00	\N
530	13	1	2	BLUE DARK	H&M	76-331	\N	t	\N	2026-01-05 07:24:52.03738+00	\N
531	13	1	2	BLUE DARK	H&M	76-330	\N	t	\N	2026-01-05 07:24:52.046076+00	\N
532	13	1	2	BLUE DARK	H&M	76-329	\N	t	\N	2026-01-05 07:24:52.052007+00	\N
533	13	1	4	BLUE BRIGHT	H&M	76-328	\N	t	\N	2026-01-05 07:24:52.060311+00	\N
534	13	1	2	BLUE DARK	H&M	76-327	\N	t	\N	2026-01-05 07:24:52.067179+00	\N
535	13	1	5	BLUE MEDIUM	H&M	76-326	\N	t	\N	2026-01-05 07:24:52.073871+00	\N
536	13	1	4	BLUE BRIGHT	H&M	76-325	\N	t	\N	2026-01-05 07:24:52.0831+00	\N
537	13	1	4	BLUE BRIGHT	H&M	76-324	\N	t	\N	2026-01-05 07:24:52.088868+00	\N
538	13	1	2	BLUE DARK	H&M	76-323	\N	t	\N	2026-01-05 07:24:52.098321+00	\N
539	13	1	4	BLUE BRIGHT	H&M	76-322	\N	t	\N	2026-01-05 07:24:52.104546+00	\N
540	13	1	4	BLUE BRIGHT	H&M	76-321	\N	t	\N	2026-01-05 07:24:52.11373+00	\N
541	13	1	4	BLUE BRIGHT	H&M	76-320	\N	t	\N	2026-01-05 07:24:52.120196+00	\N
542	13	1	4	BLUE BRIGHT	H&M	76-319	\N	t	\N	2026-01-05 07:24:52.129364+00	\N
543	13	1	2	BLUE DARK	H&M	76-318	\N	t	\N	2026-01-05 07:24:52.135842+00	\N
544	13	1	5	BLUE MEDIUM	H&M	76-317	\N	t	\N	2026-01-05 07:24:52.14402+00	\N
545	13	1	4	BLUE BRIGHT	H&M	76-316	\N	t	\N	2026-01-05 07:24:52.150966+00	\N
546	13	1	5	BLUE MEDIUM	H&M	76-315	\N	t	\N	2026-01-05 07:24:52.156901+00	\N
547	13	1	4	BLUE BRIGHT	H&M	76-314	\N	t	\N	2026-01-05 07:24:52.167302+00	\N
548	13	1	4	BLUE BRIGHT	H&M	76-313	\N	t	\N	2026-01-05 07:24:52.176418+00	\N
549	13	1	4	BLUE BRIGHT	H&M	76-312	\N	t	\N	2026-01-05 07:24:52.185973+00	\N
550	13	1	4	BLUE BRIGHT	H&M	76-311	\N	t	\N	2026-01-05 07:24:52.194362+00	\N
551	13	1	4	BLUE BRIGHT	H&M	76-310	\N	t	\N	2026-01-05 07:24:52.201477+00	\N
552	13	1	5	BLUE MEDIUM	H&M	76-309	\N	t	\N	2026-01-05 07:24:52.209783+00	\N
553	13	1	5	BLUE MEDIUM	H&M	76-308	\N	t	\N	2026-01-05 07:24:52.21657+00	\N
554	13	1	5	BLUE MEDIUM	H&M	76-307	\N	t	\N	2026-01-05 07:24:52.222682+00	\N
555	13	1	5	BLUE MEDIUM	H&M	76-306	\N	t	\N	2026-01-05 07:24:52.236708+00	\N
556	13	1	2	BLUE DARK	H&M	76-305	\N	t	\N	2026-01-05 07:24:52.253627+00	\N
557	13	1	2	BLUE DARK	H&M	76-304	\N	t	\N	2026-01-05 07:24:52.267707+00	\N
558	13	1	2	BLUE DARK	H&M	76-303	\N	t	\N	2026-01-05 07:24:52.284275+00	\N
559	13	1	2	BLUE DARK	H&M	76-302	\N	t	\N	2026-01-05 07:24:52.294826+00	\N
560	13	1	2	BLUE DARK	H&M	76-301	\N	t	\N	2026-01-05 07:24:52.303491+00	\N
561	13	1	5	BLUE MEDIUM	H&M	76-299	\N	t	\N	2026-01-05 07:24:52.321265+00	\N
562	13	1	1	BLUE MEDIUM DUSTY	H&M	76-298	\N	t	\N	2026-01-05 07:24:52.343354+00	\N
563	13	1	1	BLUE MEDIUM DUSTY	H&M	76-297	\N	t	\N	2026-01-05 07:24:52.35118+00	\N
564	13	1	2	BLUE DARK	H&M	76-242	\N	t	\N	2026-01-05 07:24:52.359569+00	\N
565	13	1	5	BLUE MEDIUM	H&M	76-241	\N	t	\N	2026-01-05 07:24:52.366318+00	\N
566	13	1	1	BLUE MEDIUM DUSTY	H&M	76-240	\N	t	\N	2026-01-05 07:24:52.372012+00	\N
567	13	1	5	BLUE MEDIUM	H&M	76-239	\N	t	\N	2026-01-05 07:24:52.380718+00	\N
568	13	1	2	BLUE DARK	H&M	76-238	\N	t	\N	2026-01-05 07:24:52.386566+00	\N
569	13	1	2	BLUE DARK	H&M	76-237	\N	t	\N	2026-01-05 07:24:52.393953+00	\N
570	13	1	1	BLUE MEDIUM DUSTY	H&M	76-236	\N	t	\N	2026-01-05 07:24:52.400823+00	\N
571	13	1	1	BLUE MEDIUM DUSTY	H&M	76-235	\N	t	\N	2026-01-05 07:24:52.408946+00	\N
572	13	1	5	BLUE MEDIUM	H&M	76-234	\N	t	\N	2026-01-05 07:24:52.416315+00	\N
573	13	1	5	BLUE MEDIUM	H&M	76-233	\N	t	\N	2026-01-05 07:24:52.422576+00	\N
574	13	1	2	BLUE DARK	H&M	76-232	\N	t	\N	2026-01-05 07:24:52.433754+00	\N
575	13	1	2	BLUE DARK	H&M	76-231	\N	t	\N	2026-01-05 07:24:52.443855+00	\N
576	13	1	2	BLUE DARK	H&M	76-230	\N	t	\N	2026-01-05 07:24:52.452491+00	\N
577	13	1	2	BLUE DARK	H&M	76-229	\N	t	\N	2026-01-05 07:24:52.460701+00	\N
578	13	1	2	BLUE DARK	H&M	76-228	\N	t	\N	2026-01-05 07:24:52.468101+00	\N
579	13	1	5	BLUE MEDIUM	H&M	76-227	\N	t	\N	2026-01-05 07:24:52.477048+00	\N
580	13	1	2	BLUE DARK	H&M	76-226	\N	t	\N	2026-01-05 07:24:52.484458+00	\N
581	13	1	2	BLUE DARK	H&M	76-225	\N	t	\N	2026-01-05 07:24:52.492899+00	\N
582	13	1	2	BLUE DARK	H&M	76-224	\N	t	\N	2026-01-05 07:24:52.500371+00	\N
583	13	1	2	BLUE DARK	H&M	76-223	\N	t	\N	2026-01-05 07:24:52.507152+00	\N
584	13	1	5	BLUE MEDIUM	H&M	76-222	\N	t	\N	2026-01-05 07:24:52.517158+00	\N
585	13	1	1	BLUE MEDIUM DUSTY	H&M	76-221	\N	t	\N	2026-01-05 07:24:52.523842+00	\N
586	13	1	5	BLUE MEDIUM	H&M	76-220	\N	t	\N	2026-01-05 07:24:52.534138+00	\N
587	13	1	5	BLUE MEDIUM	H&M	76-219	\N	t	\N	2026-01-05 07:24:52.542966+00	\N
588	13	1	2	BLUE DARK	H&M	76-218	\N	t	\N	2026-01-05 07:24:52.550523+00	\N
589	13	1	2	BLUE DARK	H&M	76-217	\N	t	\N	2026-01-05 07:24:52.556795+00	\N
590	13	1	2	BLUE DARK	H&M	76-216	\N	t	\N	2026-01-05 07:24:52.566065+00	\N
591	13	1	2	BLUE DARK	H&M	76-215	\N	t	\N	2026-01-05 07:24:52.571811+00	\N
592	13	1	5	BLUE MEDIUM	H&M	76-214	\N	t	\N	2026-01-05 07:24:52.580814+00	\N
593	13	1	1	BLUE MEDIUM DUSTY	H&M	76-213	\N	t	\N	2026-01-05 07:24:52.587189+00	\N
594	13	1	2	BLUE DARK	H&M	76-212	\N	t	\N	2026-01-05 07:24:52.596539+00	\N
595	13	1	5	BLUE MEDIUM	H&M	76-211	\N	t	\N	2026-01-05 07:24:52.60298+00	\N
596	13	1	1	BLUE MEDIUM DUSTY	H&M	76-210	\N	t	\N	2026-01-05 07:24:52.611443+00	\N
597	13	1	5	BLUE MEDIUM	H&M	76-209	\N	t	\N	2026-01-05 07:24:52.618272+00	\N
598	13	1	2	BLUE DARK	H&M	76-208	\N	t	\N	2026-01-05 07:24:52.626495+00	\N
599	13	1	1	BLUE MEDIUM DUSTY	H&M	76-207	\N	t	\N	2026-01-05 07:24:52.633763+00	\N
600	13	1	2	BLUE DARK	H&M	76-206	\N	t	\N	2026-01-05 07:24:52.64+00	\N
601	13	1	2	BLUE DARK	H&M	76-205	\N	t	\N	2026-01-05 07:24:52.648945+00	\N
602	13	1	1	BLUE MEDIUM DUSTY	H&M	76-204	\N	t	\N	2026-01-05 07:24:52.654813+00	\N
603	13	1	5	BLUE MEDIUM	H&M	76-203	\N	t	\N	2026-01-05 07:24:52.664195+00	\N
604	13	1	2	BLUE DARK	H&M	76-202	\N	t	\N	2026-01-05 07:24:52.670834+00	\N
605	13	1	2	BLUE DARK	H&M	76-201	\N	t	\N	2026-01-05 07:24:52.680769+00	\N
606	13	1	2	BLUE DARK	H&M	76-129	\N	t	\N	2026-01-05 07:24:52.687542+00	\N
607	13	1	1	BLUE MEDIUM DUSTY	H&M	76-128	\N	t	\N	2026-01-05 07:24:52.697702+00	\N
608	13	1	2	BLUE DARK	H&M	76-127	\N	t	\N	2026-01-05 07:24:52.70439+00	\N
609	13	1	2	BLUE DARK	H&M	76-126	\N	t	\N	2026-01-05 07:24:52.714592+00	\N
610	13	1	2	BLUE DARK	H&M	76-125	\N	t	\N	2026-01-05 07:24:52.721725+00	\N
611	13	1	2	BLUE DARK	H&M	76-124	\N	t	\N	2026-01-05 07:24:52.731434+00	\N
612	13	1	2	BLUE DARK	H&M	76-123	\N	t	\N	2026-01-05 07:24:52.737863+00	\N
613	13	1	1	BLUE MEDIUM DUSTY	H&M	76-121	\N	t	\N	2026-01-05 07:24:52.747698+00	\N
614	13	1	2	BLUE DARK	H&M	76-120	\N	t	\N	2026-01-05 07:24:52.754317+00	\N
615	13	1	2	BLUE DARK	H&M	76-119	\N	t	\N	2026-01-05 07:24:52.763803+00	\N
616	13	1	2	BLUE DARK	H&M	76-118	\N	t	\N	2026-01-05 07:24:52.770389+00	\N
617	13	1	2	BLUE DARK	H&M	76-117	\N	t	\N	2026-01-05 07:24:52.779818+00	\N
618	13	1	1	BLUE MEDIUM DUSTY	H&M	76-116	\N	t	\N	2026-01-05 07:24:52.786501+00	\N
619	13	1	2	BLUE DARK	H&M	76-115	\N	t	\N	2026-01-05 07:24:52.795985+00	\N
620	13	1	2	BLUE DARK	H&M	76-114	\N	t	\N	2026-01-05 07:24:52.802554+00	\N
621	13	1	2	BLUE DARK	H&M	76-113	\N	t	\N	2026-01-05 07:24:52.810821+00	\N
622	13	1	2	BLUE DARK	H&M	76-112	\N	t	\N	2026-01-05 07:24:52.817735+00	\N
623	13	1	2	BLUE DARK	H&M	76-111	\N	t	\N	2026-01-05 07:24:52.826131+00	\N
624	13	1	1	BLUE MEDIUM DUSTY	H&M	76-110	\N	t	\N	2026-01-05 07:24:52.833391+00	\N
625	13	1	2	BLUE DARK	H&M	76-109	\N	t	\N	2026-01-05 07:24:52.841272+00	\N
626	13	1	2	BLUE DARK	H&M	76-108	\N	t	\N	2026-01-05 07:24:52.849881+00	\N
627	13	1	2	BLUE DARK	H&M	76-107	\N	t	\N	2026-01-05 07:24:52.856223+00	\N
628	13	1	1	BLUE MEDIUM DUSTY	H&M	76-106	\N	t	\N	2026-01-05 07:24:52.867178+00	\N
629	13	1	3	BLUE DUSTY LIGHT	H&M	76-105	\N	t	\N	2026-01-05 07:24:52.874038+00	\N
630	13	1	2	BLUE DARK	H&M	76-104	\N	t	\N	2026-01-05 07:24:52.883881+00	\N
631	13	1	1	BLUE MEDIUM DUSTY	H&M	76-103	\N	t	\N	2026-01-05 07:24:52.893176+00	\N
632	13	1	1	BLUE MEDIUM DUSTY	H&M	76-102	\N	t	\N	2026-01-05 07:24:52.900218+00	\N
633	13	1	1	BLUE MEDIUM DUSTY	H&M	76-101	\N	t	\N	2026-01-05 07:24:52.906544+00	\N
634	13	1	4	BLUE BRIGHT	H&M	75-313	\N	t	\N	2026-01-05 07:24:52.916189+00	\N
635	13	1	5	BLUE MEDIUM	H&M	75-312	\N	t	\N	2026-01-05 07:24:52.922595+00	\N
636	13	1	5	BLUE MEDIUM	H&M	75-311	\N	t	\N	2026-01-05 07:24:52.93289+00	\N
637	13	1	5	BLUE MEDIUM	H&M	75-310	\N	t	\N	2026-01-05 07:24:52.939734+00	\N
638	13	1	4	BLUE BRIGHT	H&M	75-309	\N	t	\N	2026-01-05 07:24:52.94989+00	\N
639	13	1	4	BLUE BRIGHT	H&M	75-308	\N	t	\N	2026-01-05 07:24:52.958079+00	\N
640	13	1	5	BLUE MEDIUM	H&M	75-307	\N	t	\N	2026-01-05 07:24:52.967059+00	\N
641	13	1	5	BLUE MEDIUM	H&M	75-306	\N	t	\N	2026-01-05 07:24:52.97585+00	\N
642	13	1	5	BLUE MEDIUM	H&M	75-305	\N	t	\N	2026-01-05 07:24:52.983253+00	\N
643	13	1	5	BLUE MEDIUM	H&M	75-304	\N	t	\N	2026-01-05 07:24:52.990868+00	\N
644	13	1	5	BLUE MEDIUM	H&M	75-301	\N	t	\N	2026-01-05 07:24:52.999986+00	\N
645	13	1	5	BLUE MEDIUM	H&M	75-299	\N	t	\N	2026-01-05 07:24:53.006691+00	\N
646	13	1	5	BLUE MEDIUM	H&M	75-298	\N	t	\N	2026-01-05 07:24:53.016365+00	\N
647	13	1	6	BLUE LIGHT	H&M	75-223	\N	t	\N	2026-01-05 07:24:53.023019+00	\N
648	13	1	5	BLUE MEDIUM	H&M	75-222	\N	t	\N	2026-01-05 07:24:53.032873+00	\N
649	13	1	5	BLUE MEDIUM	H&M	75-221	\N	t	\N	2026-01-05 07:24:53.039716+00	\N
650	13	1	5	BLUE MEDIUM	H&M	75-220	\N	t	\N	2026-01-05 07:24:53.050505+00	\N
651	13	1	5	BLUE MEDIUM	H&M	75-219	\N	t	\N	2026-01-05 07:24:53.05973+00	\N
652	13	1	5	BLUE MEDIUM	H&M	75-218	\N	t	\N	2026-01-05 07:24:53.068126+00	\N
653	13	1	5	BLUE MEDIUM	H&M	75-217	\N	t	\N	2026-01-05 07:24:53.076809+00	\N
654	13	1	5	BLUE MEDIUM	H&M	75-214	\N	t	\N	2026-01-05 07:24:53.084713+00	\N
655	13	1	6	BLUE LIGHT	H&M	75-213	\N	t	\N	2026-01-05 07:24:53.093203+00	\N
656	13	1	5	BLUE MEDIUM	H&M	75-212	\N	t	\N	2026-01-05 07:24:53.10063+00	\N
657	13	1	5	BLUE MEDIUM	H&M	75-211	\N	t	\N	2026-01-05 07:24:53.110836+00	\N
658	13	1	6	BLUE LIGHT	H&M	75-210	\N	t	\N	2026-01-05 07:24:53.122723+00	\N
659	13	1	6	BLUE LIGHT	H&M	75-209	\N	t	\N	2026-01-05 07:24:53.139498+00	\N
660	13	1	5	BLUE MEDIUM	H&M	75-207	\N	t	\N	2026-01-05 07:24:53.154948+00	\N
661	13	1	5	BLUE MEDIUM	H&M	75-206	\N	t	\N	2026-01-05 07:24:53.170316+00	\N
662	13	1	5	BLUE MEDIUM	H&M	75-205	\N	t	\N	2026-01-05 07:24:53.191893+00	\N
663	13	1	5	BLUE MEDIUM	H&M	75-204	\N	t	\N	2026-01-05 07:24:53.205171+00	\N
664	13	1	6	BLUE LIGHT	H&M	75-203	\N	t	\N	2026-01-05 07:24:53.22059+00	\N
665	13	1	5	BLUE MEDIUM	H&M	75-202	\N	t	\N	2026-01-05 07:24:53.235025+00	\N
666	13	1	6	BLUE LIGHT	H&M	75-201	\N	t	\N	2026-01-05 07:24:53.246584+00	\N
667	13	1	1	BLUE MEDIUM DUSTY	H&M	75-199	\N	t	\N	2026-01-05 07:24:53.253765+00	\N
668	13	1	1	BLUE MEDIUM DUSTY	H&M	75-111	\N	t	\N	2026-01-05 07:24:53.263952+00	\N
669	13	1	1	BLUE MEDIUM DUSTY	H&M	75-110	\N	t	\N	2026-01-05 07:24:53.271074+00	\N
670	13	1	1	BLUE MEDIUM DUSTY	H&M	75-109	\N	t	\N	2026-01-05 07:24:53.281039+00	\N
671	13	1	1	BLUE MEDIUM DUSTY	H&M	75-108	\N	t	\N	2026-01-05 07:24:53.287938+00	\N
672	13	1	1	BLUE MEDIUM DUSTY	H&M	75-107	\N	t	\N	2026-01-05 07:24:53.296545+00	\N
673	13	1	1	BLUE MEDIUM DUSTY	H&M	75-106	\N	t	\N	2026-01-05 07:24:53.302275+00	\N
674	13	1	3	BLUE DUSTY LIGHT	H&M	75-105	\N	t	\N	2026-01-05 07:24:53.309849+00	\N
675	13	1	3	BLUE DUSTY LIGHT	H&M	75-104	\N	t	\N	2026-01-05 07:24:53.316969+00	\N
676	13	1	1	BLUE MEDIUM DUSTY	H&M	75-103	\N	t	\N	2026-01-05 07:24:53.326099+00	\N
677	13	1	6	BLUE LIGHT	H&M	75-102	\N	t	\N	2026-01-05 07:24:53.332911+00	\N
678	13	1	1	BLUE MEDIUM DUSTY	H&M	75-101	\N	t	\N	2026-01-05 07:24:53.338538+00	\N
679	13	1	6	BLUE LIGHT	H&M	74-399	\N	t	\N	2026-01-05 07:24:53.34767+00	\N
680	13	1	6	BLUE LIGHT	H&M	74-313	\N	t	\N	2026-01-05 07:24:53.353168+00	\N
681	13	1	5	BLUE MEDIUM	H&M	74-312	\N	t	\N	2026-01-05 07:24:53.362222+00	\N
682	13	1	6	BLUE LIGHT	H&M	74-311	\N	t	\N	2026-01-05 07:24:53.36833+00	\N
683	13	1	6	BLUE LIGHT	H&M	74-310	\N	t	\N	2026-01-05 07:24:53.376725+00	\N
684	13	1	6	BLUE LIGHT	H&M	74-309	\N	t	\N	2026-01-05 07:24:53.383093+00	\N
685	13	1	6	BLUE LIGHT	H&M	74-308	\N	t	\N	2026-01-05 07:24:53.389657+00	\N
686	13	1	6	BLUE LIGHT	H&M	74-307	\N	t	\N	2026-01-05 07:24:53.400014+00	\N
687	13	1	6	BLUE LIGHT	H&M	74-306	\N	t	\N	2026-01-05 07:24:53.409305+00	\N
688	13	1	6	BLUE LIGHT	H&M	74-305	\N	t	\N	2026-01-05 07:24:53.416859+00	\N
689	13	1	6	BLUE LIGHT	H&M	74-304	\N	t	\N	2026-01-05 07:24:53.42447+00	\N
690	13	1	6	BLUE LIGHT	H&M	74-303	\N	t	\N	2026-01-05 07:24:53.432604+00	\N
691	13	1	6	BLUE LIGHT	H&M	74-302	\N	t	\N	2026-01-05 07:24:53.439054+00	\N
692	13	1	6	BLUE LIGHT	H&M	74-301	\N	t	\N	2026-01-05 07:24:53.449517+00	\N
693	13	1	6	BLUE LIGHT	H&M	74-299	\N	t	\N	2026-01-05 07:24:53.456104+00	\N
694	13	1	6	BLUE LIGHT	H&M	74-298	\N	t	\N	2026-01-05 07:24:53.465665+00	\N
695	13	1	6	BLUE LIGHT	H&M	74-297	\N	t	\N	2026-01-05 07:24:53.471881+00	\N
696	13	1	6	BLUE LIGHT	H&M	74-214	\N	t	\N	2026-01-05 07:24:53.482133+00	\N
697	13	1	6	BLUE LIGHT	H&M	74-213	\N	t	\N	2026-01-05 07:24:53.488376+00	\N
698	13	1	6	BLUE LIGHT	H&M	74-212	\N	t	\N	2026-01-05 07:24:53.497942+00	\N
699	13	1	6	BLUE LIGHT	H&M	74-211	\N	t	\N	2026-01-05 07:24:53.504178+00	\N
700	13	1	3	BLUE DUSTY LIGHT	H&M	74-210	\N	t	\N	2026-01-05 07:24:53.513678+00	\N
701	13	1	6	BLUE LIGHT	H&M	74-209	\N	t	\N	2026-01-05 07:24:53.520129+00	\N
702	13	1	6	BLUE LIGHT	H&M	74-208	\N	t	\N	2026-01-05 07:24:53.529112+00	\N
703	13	1	6	BLUE LIGHT	H&M	74-207	\N	t	\N	2026-01-05 07:24:53.535619+00	\N
704	13	1	3	BLUE DUSTY LIGHT	H&M	74-206	\N	t	\N	2026-01-05 07:24:53.544653+00	\N
705	13	1	6	BLUE LIGHT	H&M	74-205	\N	t	\N	2026-01-05 07:24:53.551634+00	\N
706	13	1	6	BLUE LIGHT	H&M	74-204	\N	t	\N	2026-01-05 07:24:53.559635+00	\N
707	13	1	6	BLUE LIGHT	H&M	74-203	\N	t	\N	2026-01-05 07:24:53.566481+00	\N
708	13	1	6	BLUE LIGHT	H&M	74-202	\N	t	\N	2026-01-05 07:24:53.573554+00	\N
709	13	1	6	BLUE LIGHT	H&M	74-201	\N	t	\N	2026-01-05 07:24:53.583617+00	\N
710	13	1	6	BLUE LIGHT	H&M	74-199	\N	t	\N	2026-01-05 07:24:53.592238+00	\N
711	13	1	3	BLUE DUSTY LIGHT	H&M	74-198	\N	t	\N	2026-01-05 07:24:53.599567+00	\N
712	13	1	3	BLUE DUSTY LIGHT	H&M	74-111	\N	t	\N	2026-01-05 07:24:53.606077+00	\N
713	13	1	3	BLUE DUSTY LIGHT	H&M	74-110	\N	t	\N	2026-01-05 07:24:53.61531+00	\N
714	13	1	3	BLUE DUSTY LIGHT	H&M	74-109	\N	t	\N	2026-01-05 07:24:53.621529+00	\N
715	13	1	3	BLUE DUSTY LIGHT	H&M	74-108	\N	t	\N	2026-01-05 07:24:53.630943+00	\N
716	13	1	3	BLUE DUSTY LIGHT	H&M	74-107	\N	t	\N	2026-01-05 07:24:53.637273+00	\N
717	13	1	3	BLUE DUSTY LIGHT	H&M	74-106	\N	t	\N	2026-01-05 07:24:53.646103+00	\N
718	13	1	3	BLUE DUSTY LIGHT	H&M	74-105	\N	t	\N	2026-01-05 07:24:53.652775+00	\N
719	13	1	3	BLUE DUSTY LIGHT	H&M	74-104	\N	t	\N	2026-01-05 07:24:53.66144+00	\N
720	13	1	3	BLUE DUSTY LIGHT	H&M	74-103	\N	t	\N	2026-01-05 07:24:53.667847+00	\N
721	13	1	3	BLUE DUSTY LIGHT	H&M	74-102	\N	t	\N	2026-01-05 07:24:53.675952+00	\N
722	13	1	3	BLUE DUSTY LIGHT	H&M	74-101	\N	t	\N	2026-01-05 07:24:53.683057+00	\N
723	13	1	2	BLUE DARK	H&M	73-324	\N	t	\N	2026-01-05 07:24:53.689682+00	\N
724	13	1	5	BLUE MEDIUM	H&M	73-323	\N	t	\N	2026-01-05 07:24:53.699032+00	\N
725	13	1	2	BLUE DARK	H&M	73-322	\N	t	\N	2026-01-05 07:24:53.705485+00	\N
726	13	1	4	BLUE BRIGHT	H&M	73-321	\N	t	\N	2026-01-05 07:24:53.715206+00	\N
727	13	1	4	BLUE BRIGHT	H&M	73-320	\N	t	\N	2026-01-05 07:24:53.721213+00	\N
728	13	1	4	BLUE BRIGHT	H&M	73-319	\N	t	\N	2026-01-05 07:24:53.730808+00	\N
729	13	1	4	BLUE BRIGHT	H&M	73-318	\N	t	\N	2026-01-05 07:24:53.737621+00	\N
730	13	1	2	BLUE DARK	H&M	73-317	\N	t	\N	2026-01-05 07:24:53.747598+00	\N
731	13	1	4	BLUE BRIGHT	H&M	73-315	\N	t	\N	2026-01-05 07:24:53.754454+00	\N
732	13	1	5	BLUE MEDIUM	H&M	73-314	\N	t	\N	2026-01-05 07:24:53.763817+00	\N
733	13	1	4	BLUE BRIGHT	H&M	73-313	\N	t	\N	2026-01-05 07:24:53.770069+00	\N
734	13	1	4	BLUE BRIGHT	H&M	73-312	\N	t	\N	2026-01-05 07:24:53.778988+00	\N
735	13	1	4	BLUE BRIGHT	H&M	73-311	\N	t	\N	2026-01-05 07:24:53.78529+00	\N
736	13	1	5	BLUE MEDIUM	H&M	73-310	\N	t	\N	2026-01-05 07:24:53.792803+00	\N
737	13	1	4	BLUE BRIGHT	H&M	73-309	\N	t	\N	2026-01-05 07:24:53.79876+00	\N
738	13	1	5	BLUE MEDIUM	H&M	73-308	\N	t	\N	2026-01-05 07:24:53.80458+00	\N
739	13	1	4	BLUE BRIGHT	H&M	73-307	\N	t	\N	2026-01-05 07:24:53.81328+00	\N
740	13	1	4	BLUE BRIGHT	H&M	73-306	\N	t	\N	2026-01-05 07:24:53.819761+00	\N
741	13	1	5	BLUE MEDIUM	H&M	73-305	\N	t	\N	2026-01-05 07:24:53.829715+00	\N
742	13	1	5	BLUE MEDIUM	H&M	73-304	\N	t	\N	2026-01-05 07:24:53.837252+00	\N
743	13	1	2	BLUE DARK	H&M	73-303	\N	t	\N	2026-01-05 07:24:53.850177+00	\N
744	13	1	2	BLUE DARK	H&M	73-302	\N	t	\N	2026-01-05 07:24:53.863006+00	\N
745	13	1	2	BLUE DARK	H&M	73-301	\N	t	\N	2026-01-05 07:24:53.87176+00	\N
746	13	1	2	BLUE DARK	H&M	73-225	\N	t	\N	2026-01-05 07:24:53.883705+00	\N
747	13	1	2	BLUE DARK	H&M	73-224	\N	t	\N	2026-01-05 07:24:53.894843+00	\N
748	13	1	2	BLUE DARK	H&M	73-223	\N	t	\N	2026-01-05 07:24:53.904351+00	\N
749	13	1	2	BLUE DARK	H&M	73-222	\N	t	\N	2026-01-05 07:24:53.920393+00	\N
750	13	1	2	BLUE DARK	H&M	73-221	\N	t	\N	2026-01-05 07:24:53.935039+00	\N
751	13	1	2	BLUE DARK	H&M	73-220	\N	t	\N	2026-01-05 07:24:53.94974+00	\N
752	13	1	2	BLUE DARK	H&M	73-219	\N	t	\N	2026-01-05 07:24:53.961605+00	\N
753	13	1	2	BLUE DARK	H&M	73-218	\N	t	\N	2026-01-05 07:24:53.971729+00	\N
754	13	1	2	BLUE DARK	H&M	73-217	\N	t	\N	2026-01-05 07:24:53.983935+00	\N
755	13	1	2	BLUE DARK	H&M	73-216	\N	t	\N	2026-01-05 07:24:53.993833+00	\N
756	13	1	2	BLUE DARK	H&M	73-215	\N	t	\N	2026-01-05 07:24:54.002484+00	\N
757	13	1	2	BLUE DARK	H&M	73-214	\N	t	\N	2026-01-05 07:24:54.015639+00	\N
758	13	1	2	BLUE DARK	H&M	73-213	\N	t	\N	2026-01-05 07:24:54.025802+00	\N
759	13	1	2	BLUE DARK	H&M	73-212	\N	t	\N	2026-01-05 07:24:54.033762+00	\N
760	13	1	2	BLUE DARK	H&M	73-211	\N	t	\N	2026-01-05 07:24:54.043038+00	\N
761	13	1	2	BLUE DARK	H&M	73-210	\N	t	\N	2026-01-05 07:24:54.050838+00	\N
762	13	1	5	BLUE MEDIUM	H&M	73-209	\N	t	\N	2026-01-05 07:24:54.059913+00	\N
763	13	1	1	BLUE MEDIUM DUSTY	H&M	73-208	\N	t	\N	2026-01-05 07:24:54.067896+00	\N
764	13	1	2	BLUE DARK	H&M	73-206	\N	t	\N	2026-01-05 07:24:54.078686+00	\N
765	13	1	2	BLUE DARK	H&M	73-205	\N	t	\N	2026-01-05 07:24:54.085133+00	\N
766	13	1	5	BLUE MEDIUM	H&M	73-204	\N	t	\N	2026-01-05 07:24:54.094738+00	\N
767	13	1	5	BLUE MEDIUM	H&M	73-203	\N	t	\N	2026-01-05 07:24:54.101613+00	\N
768	13	1	2	BLUE DARK	H&M	73-202	\N	t	\N	2026-01-05 07:24:54.13696+00	\N
769	13	1	2	BLUE DARK	H&M	73-201	\N	t	\N	2026-01-05 07:24:54.154427+00	\N
770	13	1	2	BLUE DARK	H&M	73-106	\N	t	\N	2026-01-05 07:24:54.171735+00	\N
771	13	1	2	BLUE DARK	H&M	73-105	\N	t	\N	2026-01-05 07:24:54.194552+00	\N
772	13	1	2	BLUE DARK	H&M	73-103	\N	t	\N	2026-01-05 07:24:54.204725+00	\N
773	13	1	5	BLUE MEDIUM	H&M	72-312	\N	t	\N	2026-01-05 07:24:54.220011+00	\N
774	13	1	5	BLUE MEDIUM	H&M	72-311	\N	t	\N	2026-01-05 07:24:54.234753+00	\N
775	13	1	5	BLUE MEDIUM	H&M	72-308	\N	t	\N	2026-01-05 07:24:54.255547+00	\N
776	13	1	5	BLUE MEDIUM	H&M	72-307	\N	t	\N	2026-01-05 07:24:54.26972+00	\N
777	13	1	5	BLUE MEDIUM	H&M	72-306	\N	t	\N	2026-01-05 07:24:54.280235+00	\N
778	13	1	5	BLUE MEDIUM	H&M	72-305	\N	t	\N	2026-01-05 07:24:54.287589+00	\N
779	13	1	5	BLUE MEDIUM	H&M	72-304	\N	t	\N	2026-01-05 07:24:54.298487+00	\N
780	13	1	5	BLUE MEDIUM	H&M	72-303	\N	t	\N	2026-01-05 07:24:54.311795+00	\N
781	13	1	4	BLUE BRIGHT	H&M	72-302	\N	t	\N	2026-01-05 07:24:54.321928+00	\N
782	13	1	5	BLUE MEDIUM	H&M	72-301	\N	t	\N	2026-01-05 07:24:54.336767+00	\N
783	13	1	5	BLUE MEDIUM	H&M	72-297	\N	t	\N	2026-01-05 07:24:54.346718+00	\N
784	13	1	5	BLUE MEDIUM	H&M	72-296	\N	t	\N	2026-01-05 07:24:54.352829+00	\N
785	13	1	5	BLUE MEDIUM	H&M	72-213	\N	t	\N	2026-01-05 07:24:54.361389+00	\N
786	13	1	3	BLUE DUSTY LIGHT	H&M	72-212	\N	t	\N	2026-01-05 07:24:54.367441+00	\N
787	13	1	5	BLUE MEDIUM	H&M	72-207	\N	t	\N	2026-01-05 07:24:54.375449+00	\N
788	13	1	5	BLUE MEDIUM	H&M	72-204	\N	t	\N	2026-01-05 07:24:54.381977+00	\N
789	13	1	5	BLUE MEDIUM	H&M	72-202	\N	t	\N	2026-01-05 07:24:54.387763+00	\N
790	13	1	1	BLUE MEDIUM DUSTY	H&M	72-201	\N	t	\N	2026-01-05 07:24:54.396861+00	\N
791	13	1	1	BLUE MEDIUM DUSTY	H&M	72-199	\N	t	\N	2026-01-05 07:24:54.402727+00	\N
792	13	1	1	BLUE MEDIUM DUSTY	H&M	72-107	\N	t	\N	2026-01-05 07:24:54.412129+00	\N
793	13	1	1	BLUE MEDIUM DUSTY	H&M	72-106	\N	t	\N	2026-01-05 07:24:54.418639+00	\N
794	13	1	1	BLUE MEDIUM DUSTY	H&M	72-103	\N	t	\N	2026-01-05 07:24:54.427172+00	\N
795	13	1	1	BLUE MEDIUM DUSTY	H&M	72-102	\N	t	\N	2026-01-05 07:24:54.433139+00	\N
796	13	1	1	BLUE MEDIUM DUSTY	H&M	72-101	\N	t	\N	2026-01-05 07:24:54.441189+00	\N
797	13	1	5	BLUE MEDIUM	H&M	71-304	\N	t	\N	2026-01-05 07:24:54.449399+00	\N
798	13	1	6	BLUE LIGHT	H&M	71-303	\N	t	\N	2026-01-05 07:24:54.458309+00	\N
799	13	1	3	BLUE DUSTY LIGHT	H&M	71-302	\N	t	\N	2026-01-05 07:24:54.465489+00	\N
800	13	1	6	BLUE LIGHT	H&M	71-299	\N	t	\N	2026-01-05 07:24:54.471777+00	\N
801	13	1	6	BLUE LIGHT	H&M	71-207	\N	t	\N	2026-01-05 07:24:54.480878+00	\N
802	13	1	3	BLUE DUSTY LIGHT	H&M	71-205	\N	t	\N	2026-01-05 07:24:54.486716+00	\N
803	13	1	3	BLUE DUSTY LIGHT	H&M	71-204	\N	t	\N	2026-01-05 07:24:54.497249+00	\N
804	13	1	6	BLUE LIGHT	H&M	71-203	\N	t	\N	2026-01-05 07:24:54.503744+00	\N
805	13	1	6	BLUE LIGHT	H&M	71-202	\N	t	\N	2026-01-05 07:24:54.513157+00	\N
806	13	1	3	BLUE DUSTY LIGHT	H&M	71-106	\N	t	\N	2026-01-05 07:24:54.519339+00	\N
807	13	1	3	BLUE DUSTY LIGHT	H&M	71-105	\N	t	\N	2026-01-05 07:24:54.528201+00	\N
808	13	1	3	BLUE DUSTY LIGHT	H&M	71-104	\N	t	\N	2026-01-05 07:24:54.534459+00	\N
809	13	1	6	BLUE LIGHT	H&M	71-103	\N	t	\N	2026-01-05 07:24:54.543122+00	\N
810	13	1	6	BLUE LIGHT	H&M	71-102	\N	t	\N	2026-01-05 07:24:54.549859+00	\N
811	13	1	3	BLUE DUSTY LIGHT	H&M	71-101	\N	t	\N	2026-01-05 07:24:54.558178+00	\N
812	13	1	4	BLUE BRIGHT	H&M	70-311	\N	t	\N	2026-01-05 07:24:54.56532+00	\N
813	13	1	4	BLUE BRIGHT	H&M	70-307	\N	t	\N	2026-01-05 07:24:54.571501+00	\N
814	13	1	4	BLUE BRIGHT	H&M	70-103	\N	t	\N	2026-01-05 07:24:54.580522+00	\N
815	13	1	4	BLUE BRIGHT	H&M	70-102	\N	t	\N	2026-01-05 07:24:54.586443+00	\N
816	13	1	4	BLUE BRIGHT	H&M	70-101	\N	t	\N	2026-01-05 07:24:54.595146+00	\N
817	13	1	4	BLUE BRIGHT	H&M	69-320	\N	t	\N	2026-01-05 07:24:54.601581+00	\N
818	13	1	2	BLUE DARK	H&M	69-301	\N	t	\N	2026-01-05 07:24:54.610275+00	\N
819	13	1	3	BLUE DUSTY LIGHT	H&M	07-109	\N	t	\N	2026-01-05 07:24:54.61745+00	\N
820	13	1	3	BLUE DUSTY LIGHT	H&M	07-106	\N	t	\N	2026-01-05 07:24:54.625539+00	\N
821	13	1	3	BLUE DUSTY LIGHT	H&M	06-105	\N	t	\N	2026-01-05 07:24:54.633158+00	\N
822	15	8	1	BROWN MEDIUM DUSTY	H&M	53-101	\N	t	\N	2026-01-05 07:24:54.641721+00	\N
823	15	8	1	BROWN MEDIUM DUSTY	H&M	43-306	\N	t	\N	2026-01-05 07:24:54.650797+00	\N
824	15	8	1	BROWN MEDIUM DUSTY	H&M	43-209	\N	t	\N	2026-01-05 07:24:54.658708+00	\N
825	15	8	2	BROWN DARK	H&M	43-204	\N	t	\N	2026-01-05 07:24:54.665709+00	\N
826	15	8	1	BROWN MEDIUM DUSTY	H&M	43-102	\N	t	\N	2026-01-05 07:24:54.672268+00	\N
827	15	8	1	BROWN MEDIUM DUSTY	H&M	39-222	\N	t	\N	2026-01-05 07:24:54.681426+00	\N
828	15	8	1	BROWN MEDIUM DUSTY	H&M	39-213	\N	t	\N	2026-01-05 07:24:54.687756+00	\N
829	15	8	1	BROWN MEDIUM DUSTY	H&M	39-203	\N	t	\N	2026-01-05 07:24:54.69742+00	\N
830	15	8	1	BROWN MEDIUM DUSTY	H&M	39-109	\N	t	\N	2026-01-05 07:24:54.703595+00	\N
831	15	8	1	BROWN MEDIUM DUSTY	H&M	39-108	\N	t	\N	2026-01-05 07:24:54.713754+00	\N
832	15	8	1	BROWN MEDIUM DUSTY	H&M	39-107	\N	t	\N	2026-01-05 07:24:54.720078+00	\N
833	15	8	1	BROWN MEDIUM DUSTY	H&M	39-104	\N	t	\N	2026-01-05 07:24:54.729441+00	\N
834	15	8	1	BROWN MEDIUM DUSTY	H&M	36-315	\N	t	\N	2026-01-05 07:24:54.736032+00	\N
835	15	8	1	BROWN MEDIUM DUSTY	H&M	36-314	\N	t	\N	2026-01-05 07:24:54.745025+00	\N
836	15	8	1	BROWN MEDIUM DUSTY	H&M	36-313	\N	t	\N	2026-01-05 07:24:54.75171+00	\N
837	15	8	1	BROWN MEDIUM DUSTY	H&M	36-217	\N	t	\N	2026-01-05 07:24:54.761571+00	\N
838	15	8	1	BROWN MEDIUM DUSTY	H&M	36-212	\N	t	\N	2026-01-05 07:24:54.768276+00	\N
839	15	8	1	BROWN MEDIUM DUSTY	H&M	36-210	\N	t	\N	2026-01-05 07:24:54.776985+00	\N
840	15	8	1	BROWN MEDIUM DUSTY	H&M	36-209	\N	t	\N	2026-01-05 07:24:54.783718+00	\N
841	15	8	1	BROWN MEDIUM DUSTY	H&M	36-206	\N	t	\N	2026-01-05 07:24:54.792116+00	\N
842	15	8	1	BROWN MEDIUM DUSTY	H&M	36-203	\N	t	\N	2026-01-05 07:24:54.79998+00	\N
843	15	8	1	BROWN MEDIUM DUSTY	H&M	36-202	\N	t	\N	2026-01-05 07:24:54.808483+00	\N
844	15	8	1	BROWN MEDIUM DUSTY	H&M	36-201	\N	t	\N	2026-01-05 07:24:54.815268+00	\N
845	15	8	2	BROWN DARK	H&M	36-101	\N	t	\N	2026-01-05 07:24:54.820977+00	\N
846	15	8	1	BROWN MEDIUM DUSTY	H&M	33-306	\N	t	\N	2026-01-05 07:24:54.830548+00	\N
847	15	8	1	BROWN MEDIUM DUSTY	H&M	33-304	\N	t	\N	2026-01-05 07:24:54.836483+00	\N
848	15	8	1	BROWN MEDIUM DUSTY	H&M	33-302	\N	t	\N	2026-01-05 07:24:54.8455+00	\N
849	15	8	1	BROWN MEDIUM DUSTY	H&M	33-301	\N	t	\N	2026-01-05 07:24:54.851573+00	\N
850	15	8	1	BROWN MEDIUM DUSTY	H&M	33-212	\N	t	\N	2026-01-05 07:24:54.858853+00	\N
851	15	8	1	BROWN MEDIUM DUSTY	H&M	33-211	\N	t	\N	2026-01-05 07:24:54.865304+00	\N
852	15	8	1	BROWN MEDIUM DUSTY	H&M	33-208	\N	t	\N	2026-01-05 07:24:54.871071+00	\N
853	15	8	1	BROWN MEDIUM DUSTY	H&M	33-207	\N	t	\N	2026-01-05 07:24:54.880529+00	\N
854	15	8	1	BROWN MEDIUM DUSTY	H&M	33-206	\N	t	\N	2026-01-05 07:24:54.886652+00	\N
855	15	8	1	BROWN MEDIUM DUSTY	H&M	33-205	\N	t	\N	2026-01-05 07:24:54.946506+00	\N
856	15	8	1	BROWN MEDIUM DUSTY	H&M	33-203	\N	t	\N	2026-01-05 07:24:54.952914+00	\N
857	15	8	1	BROWN MEDIUM DUSTY	H&M	33-107	\N	t	\N	2026-01-05 07:24:54.963384+00	\N
858	15	8	1	BROWN MEDIUM DUSTY	H&M	33-106	\N	t	\N	2026-01-05 07:24:54.969879+00	\N
859	15	8	1	BROWN MEDIUM DUSTY	H&M	33-101	\N	t	\N	2026-01-05 07:24:54.980388+00	\N
860	15	8	1	BROWN MEDIUM DUSTY	H&M	32-210	\N	t	\N	2026-01-05 07:24:54.98736+00	\N
861	15	8	1	BROWN MEDIUM DUSTY	H&M	32-209	\N	t	\N	2026-01-05 07:24:54.996752+00	\N
862	15	8	1	BROWN MEDIUM DUSTY	H&M	29-311	\N	t	\N	2026-01-05 07:24:55.003023+00	\N
863	15	8	1	BROWN MEDIUM DUSTY	H&M	29-306	\N	t	\N	2026-01-05 07:24:55.012879+00	\N
864	15	8	1	BROWN MEDIUM DUSTY	H&M	29-202	\N	t	\N	2026-01-05 07:24:55.019467+00	\N
865	15	8	1	BROWN MEDIUM DUSTY	H&M	29-201	\N	t	\N	2026-01-05 07:24:55.029511+00	\N
866	15	8	1	BROWN MEDIUM DUSTY	H&M	26-310	\N	t	\N	2026-01-05 07:24:55.03592+00	\N
867	15	8	1	BROWN MEDIUM DUSTY	H&M	26-307	\N	t	\N	2026-01-05 07:24:55.045298+00	\N
868	15	8	1	BROWN MEDIUM DUSTY	H&M	26-306	\N	t	\N	2026-01-05 07:24:55.052721+00	\N
869	15	8	1	BROWN MEDIUM DUSTY	H&M	26-305	\N	t	\N	2026-01-05 07:24:55.062096+00	\N
870	15	8	1	BROWN MEDIUM DUSTY	H&M	26-208	\N	t	\N	2026-01-05 07:24:55.068515+00	\N
871	15	8	1	BROWN MEDIUM DUSTY	H&M	26-207	\N	t	\N	2026-01-05 07:24:55.077945+00	\N
872	15	8	1	BROWN MEDIUM DUSTY	H&M	23-301	\N	t	\N	2026-01-05 07:24:55.084971+00	\N
873	15	8	1	BROWN MEDIUM DUSTY	H&M	19-104	\N	t	\N	2026-01-05 07:24:55.094732+00	\N
874	15	8	1	BROWN MEDIUM DUSTY	H&M	18-351	\N	t	\N	2026-01-05 07:24:55.101623+00	\N
875	15	8	1	BROWN MEDIUM DUSTY	H&M	18-350	\N	t	\N	2026-01-05 07:24:55.110076+00	\N
876	15	8	1	BROWN MEDIUM DUSTY	H&M	18-349	\N	t	\N	2026-01-05 07:24:55.116275+00	\N
877	15	8	1	BROWN MEDIUM DUSTY	H&M	18-348	\N	t	\N	2026-01-05 07:24:55.124262+00	\N
878	15	8	2	BROWN DARK	H&M	18-347	\N	t	\N	2026-01-05 07:24:55.131998+00	\N
879	15	8	1	BROWN MEDIUM DUSTY	H&M	18-345	\N	t	\N	2026-01-05 07:24:55.142472+00	\N
880	15	8	1	BROWN MEDIUM DUSTY	H&M	18-344	\N	t	\N	2026-01-05 07:24:55.151152+00	\N
881	15	8	1	BROWN MEDIUM DUSTY	H&M	18-343	\N	t	\N	2026-01-05 07:24:55.160775+00	\N
882	15	8	1	BROWN MEDIUM DUSTY	H&M	18-342	\N	t	\N	2026-01-05 07:24:55.16792+00	\N
883	15	8	2	BROWN DARK	H&M	18-341	\N	t	\N	2026-01-05 07:24:55.177533+00	\N
884	15	8	2	BROWN DARK	H&M	18-340	\N	t	\N	2026-01-05 07:24:55.184253+00	\N
885	15	8	2	BROWN DARK	H&M	18-339	\N	t	\N	2026-01-05 07:24:55.192774+00	\N
886	15	8	2	BROWN DARK	H&M	18-338	\N	t	\N	2026-01-05 07:24:55.198277+00	\N
887	15	8	2	BROWN DARK	H&M	18-337	\N	t	\N	2026-01-05 07:24:55.205924+00	\N
888	15	8	2	BROWN DARK	H&M	18-336	\N	t	\N	2026-01-05 07:24:55.212531+00	\N
889	15	8	1	BROWN MEDIUM DUSTY	H&M	18-335	\N	t	\N	2026-01-05 07:24:55.218265+00	\N
890	15	8	1	BROWN MEDIUM DUSTY	H&M	18-334	\N	t	\N	2026-01-05 07:24:55.227359+00	\N
891	15	8	1	BROWN MEDIUM DUSTY	H&M	18-333	\N	t	\N	2026-01-05 07:24:55.234293+00	\N
892	15	8	1	BROWN MEDIUM DUSTY	H&M	18-332	\N	t	\N	2026-01-05 07:24:55.244687+00	\N
893	15	8	2	BROWN DARK	H&M	18-331	\N	t	\N	2026-01-05 07:24:55.250887+00	\N
894	15	8	2	BROWN DARK	H&M	18-330	\N	t	\N	2026-01-05 07:24:55.260239+00	\N
895	15	8	1	BROWN MEDIUM DUSTY	H&M	18-329	\N	t	\N	2026-01-05 07:24:55.266744+00	\N
896	15	8	2	BROWN DARK	H&M	18-327	\N	t	\N	2026-01-05 07:24:55.275902+00	\N
897	15	8	1	BROWN MEDIUM DUSTY	H&M	18-326	\N	t	\N	2026-01-05 07:24:55.282745+00	\N
898	15	8	2	BROWN DARK	H&M	18-325	\N	t	\N	2026-01-05 07:24:55.292006+00	\N
899	15	8	1	BROWN MEDIUM DUSTY	H&M	18-324	\N	t	\N	2026-01-05 07:24:55.298749+00	\N
900	15	8	1	BROWN MEDIUM DUSTY	H&M	18-323	\N	t	\N	2026-01-05 07:24:55.306497+00	\N
901	15	8	1	BROWN MEDIUM DUSTY	H&M	18-322	\N	t	\N	2026-01-05 07:24:55.313759+00	\N
902	15	8	1	BROWN MEDIUM DUSTY	H&M	18-321	\N	t	\N	2026-01-05 07:24:55.322736+00	\N
903	15	8	1	BROWN MEDIUM DUSTY	H&M	18-320	\N	t	\N	2026-01-05 07:24:55.330607+00	\N
904	15	8	1	BROWN MEDIUM DUSTY	H&M	18-319	\N	t	\N	2026-01-05 07:24:55.339172+00	\N
905	15	8	2	BROWN DARK	H&M	18-318	\N	t	\N	2026-01-05 07:24:55.346233+00	\N
906	15	8	2	BROWN DARK	H&M	18-317	\N	t	\N	2026-01-05 07:24:55.353135+00	\N
907	15	8	1	BROWN MEDIUM DUSTY	H&M	18-316	\N	t	\N	2026-01-05 07:24:55.36207+00	\N
908	15	8	1	BROWN MEDIUM DUSTY	H&M	18-315	\N	t	\N	2026-01-05 07:24:55.368553+00	\N
909	15	8	1	BROWN MEDIUM DUSTY	H&M	18-314	\N	t	\N	2026-01-05 07:24:55.378081+00	\N
910	15	8	1	BROWN MEDIUM DUSTY	H&M	18-313	\N	t	\N	2026-01-05 07:24:55.384644+00	\N
911	15	8	1	BROWN MEDIUM DUSTY	H&M	18-312	\N	t	\N	2026-01-05 07:24:55.39427+00	\N
912	15	8	1	BROWN MEDIUM DUSTY	H&M	18-311	\N	t	\N	2026-01-05 07:24:55.400562+00	\N
913	15	8	1	BROWN MEDIUM DUSTY	H&M	18-310	\N	t	\N	2026-01-05 07:24:55.40988+00	\N
914	15	8	1	BROWN MEDIUM DUSTY	H&M	18-309	\N	t	\N	2026-01-05 07:24:55.416459+00	\N
915	15	8	1	BROWN MEDIUM DUSTY	H&M	18-308	\N	t	\N	2026-01-05 07:24:55.425904+00	\N
916	15	8	1	BROWN MEDIUM DUSTY	H&M	18-307	\N	t	\N	2026-01-05 07:24:55.432494+00	\N
917	15	8	1	BROWN MEDIUM DUSTY	H&M	18-306	\N	t	\N	2026-01-05 07:24:55.441657+00	\N
918	15	8	1	BROWN MEDIUM DUSTY	H&M	18-305	\N	t	\N	2026-01-05 07:24:55.447583+00	\N
919	15	8	1	BROWN MEDIUM DUSTY	H&M	18-304	\N	t	\N	2026-01-05 07:24:55.455679+00	\N
920	15	8	1	BROWN MEDIUM DUSTY	H&M	18-303	\N	t	\N	2026-01-05 07:24:55.462719+00	\N
921	15	8	1	BROWN MEDIUM DUSTY	H&M	18-302	\N	t	\N	2026-01-05 07:24:55.470013+00	\N
922	15	8	2	BROWN DARK	H&M	18-207	\N	t	\N	2026-01-05 07:24:55.478304+00	\N
923	15	8	1	BROWN MEDIUM DUSTY	H&M	18-205	\N	t	\N	2026-01-05 07:24:55.485084+00	\N
924	15	8	2	BROWN DARK	H&M	18-203	\N	t	\N	2026-01-05 07:24:55.49566+00	\N
925	15	8	2	BROWN DARK	H&M	18-201	\N	t	\N	2026-01-05 07:24:55.502562+00	\N
926	15	8	1	BROWN MEDIUM DUSTY	H&M	18-125	\N	t	\N	2026-01-05 07:24:55.512161+00	\N
927	15	8	1	BROWN MEDIUM DUSTY	H&M	18-124	\N	t	\N	2026-01-05 07:24:55.518442+00	\N
928	15	8	1	BROWN MEDIUM DUSTY	H&M	18-123	\N	t	\N	2026-01-05 07:24:55.528035+00	\N
929	15	8	1	BROWN MEDIUM DUSTY	H&M	18-121	\N	t	\N	2026-01-05 07:24:55.534383+00	\N
930	15	8	1	BROWN MEDIUM DUSTY	H&M	18-120	\N	t	\N	2026-01-05 07:24:55.543654+00	\N
931	15	8	1	BROWN MEDIUM DUSTY	H&M	18-119	\N	t	\N	2026-01-05 07:24:55.550001+00	\N
932	15	8	1	BROWN MEDIUM DUSTY	H&M	18-118	\N	t	\N	2026-01-05 07:24:55.560107+00	\N
933	15	8	1	BROWN MEDIUM DUSTY	H&M	18-117	\N	t	\N	2026-01-05 07:24:55.566813+00	\N
934	15	8	1	BROWN MEDIUM DUSTY	H&M	18-116	\N	t	\N	2026-01-05 07:24:55.577391+00	\N
935	15	8	1	BROWN MEDIUM DUSTY	H&M	18-115	\N	t	\N	2026-01-05 07:24:55.583655+00	\N
936	15	8	1	BROWN MEDIUM DUSTY	H&M	18-114	\N	t	\N	2026-01-05 07:24:55.592897+00	\N
937	15	8	1	BROWN MEDIUM DUSTY	H&M	18-113	\N	t	\N	2026-01-05 07:24:55.599455+00	\N
938	15	8	1	BROWN MEDIUM DUSTY	H&M	18-112	\N	t	\N	2026-01-05 07:24:55.608832+00	\N
939	15	8	1	BROWN MEDIUM DUSTY	H&M	18-111	\N	t	\N	2026-01-05 07:24:55.615195+00	\N
940	15	8	1	BROWN MEDIUM DUSTY	H&M	18-110	\N	t	\N	2026-01-05 07:24:55.623196+00	\N
941	15	8	1	BROWN MEDIUM DUSTY	H&M	18-109	\N	t	\N	2026-01-05 07:24:55.630254+00	\N
942	15	8	2	BROWN DARK	H&M	18-108	\N	t	\N	2026-01-05 07:24:55.638554+00	\N
943	15	8	1	BROWN MEDIUM DUSTY	H&M	18-107	\N	t	\N	2026-01-05 07:24:55.64588+00	\N
944	15	8	1	BROWN MEDIUM DUSTY	H&M	18-106	\N	t	\N	2026-01-05 07:24:55.652352+00	\N
945	15	8	1	BROWN MEDIUM DUSTY	H&M	18-105	\N	t	\N	2026-01-05 07:24:55.662408+00	\N
946	15	8	1	BROWN MEDIUM DUSTY	H&M	18-104	\N	t	\N	2026-01-05 07:24:55.671453+00	\N
947	15	8	1	BROWN MEDIUM DUSTY	H&M	18-103	\N	t	\N	2026-01-05 07:24:55.679132+00	\N
948	15	8	1	BROWN MEDIUM DUSTY	H&M	18-102	\N	t	\N	2026-01-05 07:24:55.685499+00	\N
949	15	8	1	BROWN MEDIUM DUSTY	H&M	18-101	\N	t	\N	2026-01-05 07:24:55.695073+00	\N
950	15	8	2	BROWN DARK	H&M	17-322	\N	t	\N	2026-01-05 07:24:55.701421+00	\N
951	15	8	2	BROWN DARK	H&M	17-320	\N	t	\N	2026-01-05 07:24:55.710948+00	\N
952	15	8	2	BROWN DARK	H&M	17-319	\N	t	\N	2026-01-05 07:24:55.71734+00	\N
953	15	8	2	BROWN DARK	H&M	17-318	\N	t	\N	2026-01-05 07:24:55.726421+00	\N
954	15	8	2	BROWN DARK	H&M	17-317	\N	t	\N	2026-01-05 07:24:55.732824+00	\N
955	15	8	2	BROWN DARK	H&M	17-316	\N	t	\N	2026-01-05 07:24:55.742+00	\N
956	15	8	2	BROWN DARK	H&M	17-315	\N	t	\N	2026-01-05 07:24:55.748385+00	\N
957	15	8	2	BROWN DARK	H&M	17-314	\N	t	\N	2026-01-05 07:24:55.756672+00	\N
958	15	8	2	BROWN DARK	H&M	17-313	\N	t	\N	2026-01-05 07:24:55.763378+00	\N
959	15	8	2	BROWN DARK	H&M	17-312	\N	t	\N	2026-01-05 07:24:55.770698+00	\N
960	15	8	2	BROWN DARK	H&M	17-311	\N	t	\N	2026-01-05 07:24:55.778348+00	\N
961	15	8	2	BROWN DARK	H&M	17-310	\N	t	\N	2026-01-05 07:24:55.784373+00	\N
962	15	8	2	BROWN DARK	H&M	17-309	\N	t	\N	2026-01-05 07:24:55.79333+00	\N
963	15	8	2	BROWN DARK	H&M	17-308	\N	t	\N	2026-01-05 07:24:55.799257+00	\N
964	15	8	2	BROWN DARK	H&M	17-307	\N	t	\N	2026-01-05 07:24:55.808171+00	\N
965	15	8	2	BROWN DARK	H&M	17-306	\N	t	\N	2026-01-05 07:24:55.814813+00	\N
966	15	8	2	BROWN DARK	H&M	17-305	\N	t	\N	2026-01-05 07:24:55.822713+00	\N
967	15	8	2	BROWN DARK	H&M	17-304	\N	t	\N	2026-01-05 07:24:55.830119+00	\N
968	15	8	2	BROWN DARK	H&M	17-303	\N	t	\N	2026-01-05 07:24:55.83944+00	\N
969	15	8	2	BROWN DARK	H&M	17-302	\N	t	\N	2026-01-05 07:24:55.847353+00	\N
970	15	8	2	BROWN DARK	H&M	17-301	\N	t	\N	2026-01-05 07:24:55.856228+00	\N
971	15	8	2	BROWN DARK	H&M	17-228	\N	t	\N	2026-01-05 07:24:55.86401+00	\N
972	15	8	2	BROWN DARK	H&M	17-227	\N	t	\N	2026-01-05 07:24:55.872728+00	\N
973	15	8	2	BROWN DARK	H&M	17-226	\N	t	\N	2026-01-05 07:24:55.880506+00	\N
974	15	8	2	BROWN DARK	H&M	17-225	\N	t	\N	2026-01-05 07:24:55.888969+00	\N
975	15	8	2	BROWN DARK	H&M	17-224	\N	t	\N	2026-01-05 07:24:55.896254+00	\N
976	15	8	2	BROWN DARK	H&M	17-223	\N	t	\N	2026-01-05 07:24:55.902652+00	\N
977	15	8	2	BROWN DARK	H&M	17-222	\N	t	\N	2026-01-05 07:24:55.912543+00	\N
978	15	8	2	BROWN DARK	H&M	17-221	\N	t	\N	2026-01-05 07:24:55.919166+00	\N
979	15	8	2	BROWN DARK	H&M	17-220	\N	t	\N	2026-01-05 07:24:55.92838+00	\N
980	15	8	2	BROWN DARK	H&M	17-219	\N	t	\N	2026-01-05 07:24:55.934469+00	\N
981	15	8	2	BROWN DARK	H&M	17-218	\N	t	\N	2026-01-05 07:24:55.944181+00	\N
982	15	8	2	BROWN DARK	H&M	17-217	\N	t	\N	2026-01-05 07:24:55.950638+00	\N
983	15	8	2	BROWN DARK	H&M	17-216	\N	t	\N	2026-01-05 07:24:55.959838+00	\N
984	15	8	2	BROWN DARK	H&M	17-215	\N	t	\N	2026-01-05 07:24:55.965683+00	\N
985	15	8	2	BROWN DARK	H&M	17-214	\N	t	\N	2026-01-05 07:24:55.974123+00	\N
986	15	8	2	BROWN DARK	H&M	17-213	\N	t	\N	2026-01-05 07:24:55.980344+00	\N
987	15	8	2	BROWN DARK	H&M	17-212	\N	t	\N	2026-01-05 07:24:55.98805+00	\N
988	15	8	2	BROWN DARK	H&M	17-211	\N	t	\N	2026-01-05 07:24:55.995127+00	\N
989	15	8	2	BROWN DARK	H&M	17-210	\N	t	\N	2026-01-05 07:24:56.001797+00	\N
990	15	8	2	BROWN DARK	H&M	17-209	\N	t	\N	2026-01-05 07:24:56.012561+00	\N
991	15	8	2	BROWN DARK	H&M	17-208	\N	t	\N	2026-01-05 07:24:56.023198+00	\N
992	15	8	2	BROWN DARK	H&M	17-207	\N	t	\N	2026-01-05 07:24:56.031661+00	\N
993	15	8	2	BROWN DARK	H&M	17-206	\N	t	\N	2026-01-05 07:24:56.042329+00	\N
994	15	8	2	BROWN DARK	H&M	17-205	\N	t	\N	2026-01-05 07:24:56.049589+00	\N
995	15	8	2	BROWN DARK	H&M	17-204	\N	t	\N	2026-01-05 07:24:56.060826+00	\N
996	15	8	2	BROWN DARK	H&M	17-203	\N	t	\N	2026-01-05 07:24:56.067478+00	\N
997	15	8	2	BROWN DARK	H&M	17-202	\N	t	\N	2026-01-05 07:24:56.077802+00	\N
998	15	8	2	BROWN DARK	H&M	17-201	\N	t	\N	2026-01-05 07:24:56.085595+00	\N
999	15	8	1	BROWN MEDIUM DUSTY	H&M	17-105	\N	t	\N	2026-01-05 07:24:56.099558+00	\N
1000	15	8	2	BROWN DARK	H&M	17-104	\N	t	\N	2026-01-05 07:24:56.108702+00	\N
1001	15	8	2	BROWN DARK	H&M	17-103	\N	t	\N	2026-01-05 07:24:56.115646+00	\N
1002	15	8	2	BROWN DARK	H&M	17-102	\N	t	\N	2026-01-05 07:24:56.12503+00	\N
1003	15	8	2	BROWN DARK	H&M	17-101	\N	t	\N	2026-01-05 07:24:56.132058+00	\N
1004	15	8	2	BROWN DARK	H&M	15-231	\N	t	\N	2026-01-05 07:24:56.13995+00	\N
1005	15	8	1	BROWN MEDIUM DUSTY	H&M	14-333	\N	t	\N	2026-01-05 07:24:56.146808+00	\N
1006	15	8	1	BROWN MEDIUM DUSTY	H&M	14-332	\N	t	\N	2026-01-05 07:24:56.153435+00	\N
1007	15	8	1	BROWN MEDIUM DUSTY	H&M	14-330	\N	t	\N	2026-01-05 07:24:56.162271+00	\N
1008	15	8	1	BROWN MEDIUM DUSTY	H&M	14-329	\N	t	\N	2026-01-05 07:24:56.168199+00	\N
1009	15	8	1	BROWN MEDIUM DUSTY	H&M	14-324	\N	t	\N	2026-01-05 07:24:56.178288+00	\N
1010	15	8	1	BROWN MEDIUM DUSTY	H&M	14-323	\N	t	\N	2026-01-05 07:24:56.185068+00	\N
1011	15	8	1	BROWN MEDIUM DUSTY	H&M	14-312	\N	t	\N	2026-01-05 07:24:56.194638+00	\N
1012	15	8	1	BROWN MEDIUM DUSTY	H&M	14-310	\N	t	\N	2026-01-05 07:24:56.201638+00	\N
1013	15	8	1	BROWN MEDIUM DUSTY	H&M	14-304	\N	t	\N	2026-01-05 07:24:56.211281+00	\N
1014	15	8	1	BROWN MEDIUM DUSTY	H&M	14-213	\N	t	\N	2026-01-05 07:24:56.217566+00	\N
1015	15	8	1	BROWN MEDIUM DUSTY	H&M	14-206	\N	t	\N	2026-01-05 07:24:56.226643+00	\N
1016	15	8	1	BROWN MEDIUM DUSTY	H&M	14-202	\N	t	\N	2026-01-05 07:24:56.23284+00	\N
1017	15	8	1	BROWN MEDIUM DUSTY	H&M	14-127	\N	t	\N	2026-01-05 07:24:56.241883+00	\N
1018	15	8	2	BROWN DARK	H&M	14-126	\N	t	\N	2026-01-05 07:24:56.248467+00	\N
1019	15	8	1	BROWN MEDIUM DUSTY	H&M	14-125	\N	t	\N	2026-01-05 07:24:56.256198+00	\N
1020	15	8	1	BROWN MEDIUM DUSTY	H&M	14-123	\N	t	\N	2026-01-05 07:24:56.263531+00	\N
1021	15	8	2	BROWN DARK	H&M	14-122	\N	t	\N	2026-01-05 07:24:56.271544+00	\N
1022	15	8	1	BROWN MEDIUM DUSTY	H&M	14-119	\N	t	\N	2026-01-05 07:24:56.279233+00	\N
1023	15	8	1	BROWN MEDIUM DUSTY	H&M	14-118	\N	t	\N	2026-01-05 07:24:56.285631+00	\N
1024	15	8	1	BROWN MEDIUM DUSTY	H&M	14-115	\N	t	\N	2026-01-05 07:24:56.294866+00	\N
1025	15	8	1	BROWN MEDIUM DUSTY	H&M	14-113	\N	t	\N	2026-01-05 07:24:56.301339+00	\N
1026	15	8	1	BROWN MEDIUM DUSTY	H&M	14-111	\N	t	\N	2026-01-05 07:24:56.310718+00	\N
1027	15	8	1	BROWN MEDIUM DUSTY	H&M	14-110	\N	t	\N	2026-01-05 07:24:56.317162+00	\N
1028	15	8	1	BROWN MEDIUM DUSTY	H&M	14-107	\N	t	\N	2026-01-05 07:24:56.326629+00	\N
1029	15	8	1	BROWN MEDIUM DUSTY	H&M	14-101	\N	t	\N	2026-01-05 07:24:56.333204+00	\N
1030	16	4	5	GREEN MEDIUM	H&M	99-303	\N	t	\N	2026-01-05 07:24:56.342648+00	\N
1031	16	4	2	GREEN DARK	H&M	99-302	\N	t	\N	2026-01-05 07:24:56.350411+00	\N
1032	16	4	5	GREEN MEDIUM	H&M	99-239	\N	t	\N	2026-01-05 07:24:56.35984+00	\N
1033	16	4	5	GREEN MEDIUM	H&M	99-238	\N	t	\N	2026-01-05 07:24:56.366613+00	\N
1034	16	4	2	GREEN DARK	H&M	99-237	\N	t	\N	2026-01-05 07:24:56.376221+00	\N
1035	16	4	5	GREEN MEDIUM	H&M	99-236	\N	t	\N	2026-01-05 07:24:56.383113+00	\N
1036	16	4	5	GREEN MEDIUM	H&M	99-233	\N	t	\N	2026-01-05 07:24:56.391891+00	\N
1037	16	4	5	GREEN MEDIUM	H&M	99-232	\N	t	\N	2026-01-05 07:24:56.399152+00	\N
1038	16	4	2	GREEN DARK	H&M	99-231	\N	t	\N	2026-01-05 07:24:56.407571+00	\N
1039	16	4	5	GREEN MEDIUM	H&M	99-230	\N	t	\N	2026-01-05 07:24:56.415531+00	\N
1040	16	4	5	GREEN MEDIUM	H&M	99-229	\N	t	\N	2026-01-05 07:24:56.424525+00	\N
1041	16	4	5	GREEN MEDIUM	H&M	99-228	\N	t	\N	2026-01-05 07:24:56.431363+00	\N
1042	16	4	5	GREEN MEDIUM	H&M	99-225	\N	t	\N	2026-01-05 07:24:56.439435+00	\N
1043	16	4	5	GREEN MEDIUM	H&M	99-223	\N	t	\N	2026-01-05 07:24:56.446755+00	\N
1044	16	4	5	GREEN MEDIUM	H&M	99-222	\N	t	\N	2026-01-05 07:24:56.453054+00	\N
1045	16	4	5	GREEN MEDIUM	H&M	99-221	\N	t	\N	2026-01-05 07:24:56.462602+00	\N
1046	16	4	5	GREEN MEDIUM	H&M	99-220	\N	t	\N	2026-01-05 07:24:56.468869+00	\N
1047	16	4	2	GREEN DARK	H&M	99-217	\N	t	\N	2026-01-05 07:24:56.478147+00	\N
1048	16	4	2	GREEN DARK	H&M	99-216	\N	t	\N	2026-01-05 07:24:56.484526+00	\N
1049	16	4	2	GREEN DARK	H&M	99-215	\N	t	\N	2026-01-05 07:24:56.493613+00	\N
1050	16	4	5	GREEN MEDIUM	H&M	99-214	\N	t	\N	2026-01-05 07:24:56.500076+00	\N
1051	16	4	2	GREEN DARK	H&M	99-213	\N	t	\N	2026-01-05 07:24:56.509133+00	\N
1052	16	4	2	GREEN DARK	H&M	99-212	\N	t	\N	2026-01-05 07:24:56.515685+00	\N
1053	16	4	2	GREEN DARK	H&M	99-211	\N	t	\N	2026-01-05 07:24:56.523616+00	\N
1054	16	4	1	GREEN MEDIUM DUSTY	H&M	99-210	\N	t	\N	2026-01-05 07:24:56.530591+00	\N
1055	16	4	2	GREEN DARK	H&M	99-209	\N	t	\N	2026-01-05 07:24:56.537731+00	\N
1056	16	4	5	GREEN MEDIUM	H&M	99-208	\N	t	\N	2026-01-05 07:24:56.547036+00	\N
1057	16	4	2	GREEN DARK	H&M	99-207	\N	t	\N	2026-01-05 07:24:56.555516+00	\N
1058	16	4	2	GREEN DARK	H&M	99-206	\N	t	\N	2026-01-05 07:24:56.563315+00	\N
1059	16	4	5	GREEN MEDIUM	H&M	99-205	\N	t	\N	2026-01-05 07:24:56.569721+00	\N
1060	16	4	5	GREEN MEDIUM	H&M	99-204	\N	t	\N	2026-01-05 07:24:56.579247+00	\N
1061	16	4	5	GREEN MEDIUM	H&M	99-203	\N	t	\N	2026-01-05 07:24:56.58568+00	\N
1062	16	4	1	GREEN MEDIUM DUSTY	H&M	99-202	\N	t	\N	2026-01-05 07:24:56.595253+00	\N
1063	16	4	5	GREEN MEDIUM	H&M	99-201	\N	t	\N	2026-01-05 07:24:56.601432+00	\N
1064	16	4	2	GREEN DARK	H&M	99-118	\N	t	\N	2026-01-05 07:24:56.611426+00	\N
1065	16	4	2	GREEN DARK	H&M	99-117	\N	t	\N	2026-01-05 07:24:56.618493+00	\N
1066	16	4	5	GREEN MEDIUM	H&M	99-116	\N	t	\N	2026-01-05 07:24:56.628256+00	\N
1067	16	4	5	GREEN MEDIUM	H&M	99-115	\N	t	\N	2026-01-05 07:24:56.634406+00	\N
1068	16	4	2	GREEN DARK	H&M	99-114	\N	t	\N	2026-01-05 07:24:56.64433+00	\N
1069	16	4	2	GREEN DARK	H&M	99-113	\N	t	\N	2026-01-05 07:24:56.651159+00	\N
1070	16	4	2	GREEN DARK	H&M	99-112	\N	t	\N	2026-01-05 07:24:56.660313+00	\N
1071	16	4	2	GREEN DARK	H&M	99-111	\N	t	\N	2026-01-05 07:24:56.66695+00	\N
1072	16	4	1	GREEN MEDIUM DUSTY	H&M	99-110	\N	t	\N	2026-01-05 07:24:56.675335+00	\N
1073	16	4	2	GREEN DARK	H&M	99-109	\N	t	\N	2026-01-05 07:24:56.682142+00	\N
1074	16	4	2	GREEN DARK	H&M	99-108	\N	t	\N	2026-01-05 07:24:56.690937+00	\N
1075	16	4	1	GREEN MEDIUM DUSTY	H&M	99-107	\N	t	\N	2026-01-05 07:24:56.698121+00	\N
1076	16	4	2	GREEN DARK	H&M	99-106	\N	t	\N	2026-01-05 07:24:56.706576+00	\N
1077	16	4	2	GREEN DARK	H&M	99-105	\N	t	\N	2026-01-05 07:24:56.714128+00	\N
1078	16	4	2	GREEN DARK	H&M	99-103	\N	t	\N	2026-01-05 07:24:56.720945+00	\N
1079	16	4	5	GREEN MEDIUM	H&M	99-102	\N	t	\N	2026-01-05 07:24:56.731469+00	\N
1080	16	4	5	GREEN MEDIUM	H&M	99-101	\N	t	\N	2026-01-05 07:24:56.73989+00	\N
1081	16	4	5	GREEN MEDIUM	H&M	98-329	\N	t	\N	2026-01-05 07:24:56.747825+00	\N
1082	16	4	5	GREEN MEDIUM	H&M	98-328	\N	t	\N	2026-01-05 07:24:56.754416+00	\N
1083	16	4	5	GREEN MEDIUM	H&M	98-327	\N	t	\N	2026-01-05 07:24:56.764034+00	\N
1084	16	4	5	GREEN MEDIUM	H&M	98-325	\N	t	\N	2026-01-05 07:24:56.77044+00	\N
1085	16	4	5	GREEN MEDIUM	H&M	98-324	\N	t	\N	2026-01-05 07:24:56.781245+00	\N
1086	16	4	5	GREEN MEDIUM	H&M	98-323	\N	t	\N	2026-01-05 07:24:56.789667+00	\N
1087	16	4	4	GREEN BRIGHT	H&M	98-322	\N	t	\N	2026-01-05 07:24:56.797763+00	\N
1088	16	4	4	GREEN BRIGHT	H&M	98-321	\N	t	\N	2026-01-05 07:24:56.806746+00	\N
1089	16	4	5	GREEN MEDIUM	H&M	98-320	\N	t	\N	2026-01-05 07:24:56.814479+00	\N
1090	16	4	5	GREEN MEDIUM	H&M	98-318	\N	t	\N	2026-01-05 07:24:56.8226+00	\N
1091	16	4	6	GREEN LIGHT	H&M	98-317	\N	t	\N	2026-01-05 07:24:56.831837+00	\N
1092	16	4	4	GREEN BRIGHT	H&M	98-316	\N	t	\N	2026-01-05 07:24:56.841032+00	\N
1093	16	4	4	GREEN BRIGHT	H&M	98-315	\N	t	\N	2026-01-05 07:24:56.848363+00	\N
1094	16	4	4	GREEN BRIGHT	H&M	98-314	\N	t	\N	2026-01-05 07:24:56.857395+00	\N
1095	16	4	4	GREEN BRIGHT	H&M	98-313	\N	t	\N	2026-01-05 07:24:56.864874+00	\N
1096	16	4	4	GREEN BRIGHT	H&M	98-312	\N	t	\N	2026-01-05 07:24:56.873514+00	\N
1097	16	4	4	GREEN BRIGHT	H&M	98-311	\N	t	\N	2026-01-05 07:24:56.88176+00	\N
1098	16	4	4	GREEN BRIGHT	H&M	98-310	\N	t	\N	2026-01-05 07:24:56.891125+00	\N
1099	16	4	5	GREEN MEDIUM	H&M	98-309	\N	t	\N	2026-01-05 07:24:56.899735+00	\N
1100	16	4	4	GREEN BRIGHT	H&M	98-308	\N	t	\N	2026-01-05 07:24:56.908458+00	\N
1101	16	4	4	GREEN BRIGHT	H&M	98-307	\N	t	\N	2026-01-05 07:24:56.916095+00	\N
1102	16	4	4	GREEN BRIGHT	H&M	98-306	\N	t	\N	2026-01-05 07:24:56.924594+00	\N
1103	16	4	4	GREEN BRIGHT	H&M	98-305	\N	t	\N	2026-01-05 07:24:56.932575+00	\N
1104	16	4	4	GREEN BRIGHT	H&M	98-304	\N	t	\N	2026-01-05 07:24:56.941198+00	\N
1105	16	4	5	GREEN MEDIUM	H&M	98-303	\N	t	\N	2026-01-05 07:24:56.948722+00	\N
1106	16	4	5	GREEN MEDIUM	H&M	98-302	\N	t	\N	2026-01-05 07:24:56.957422+00	\N
1107	16	4	5	GREEN MEDIUM	H&M	98-301	\N	t	\N	2026-01-05 07:24:56.965305+00	\N
1108	16	4	5	GREEN MEDIUM	H&M	98-245	\N	t	\N	2026-01-05 07:24:56.973824+00	\N
1109	16	4	1	GREEN MEDIUM DUSTY	H&M	98-244	\N	t	\N	2026-01-05 07:24:56.981765+00	\N
1110	16	4	5	GREEN MEDIUM	H&M	98-243	\N	t	\N	2026-01-05 07:24:56.989879+00	\N
1111	16	4	5	GREEN MEDIUM	H&M	98-242	\N	t	\N	2026-01-05 07:24:56.997899+00	\N
1112	16	4	5	GREEN MEDIUM	H&M	98-241	\N	t	\N	2026-01-05 07:24:57.005254+00	\N
1113	16	4	5	GREEN MEDIUM	H&M	98-240	\N	t	\N	2026-01-05 07:24:57.016486+00	\N
1114	16	4	5	GREEN MEDIUM	H&M	98-237	\N	t	\N	2026-01-05 07:24:57.027823+00	\N
1115	16	4	5	GREEN MEDIUM	H&M	98-236	\N	t	\N	2026-01-05 07:24:57.035828+00	\N
1116	16	4	1	GREEN MEDIUM DUSTY	H&M	98-235	\N	t	\N	2026-01-05 07:24:57.046976+00	\N
1117	16	4	5	GREEN MEDIUM	H&M	98-232	\N	t	\N	2026-01-05 07:24:57.057611+00	\N
1118	16	4	5	GREEN MEDIUM	H&M	98-231	\N	t	\N	2026-01-05 07:24:57.067169+00	\N
1119	16	4	6	GREEN LIGHT	H&M	98-224	\N	t	\N	2026-01-05 07:24:57.078918+00	\N
1120	16	4	3	GREEN DUSTY LIGHT	H&M	98-223	\N	t	\N	2026-01-05 07:24:57.091461+00	\N
1121	16	4	5	GREEN MEDIUM	H&M	98-221	\N	t	\N	2026-01-05 07:24:57.100403+00	\N
1122	16	4	5	GREEN MEDIUM	H&M	98-220	\N	t	\N	2026-01-05 07:24:57.111667+00	\N
1123	16	4	5	GREEN MEDIUM	H&M	98-219	\N	t	\N	2026-01-05 07:24:57.119393+00	\N
1124	16	4	5	GREEN MEDIUM	H&M	98-218	\N	t	\N	2026-01-05 07:24:57.131624+00	\N
1125	16	4	5	GREEN MEDIUM	H&M	98-217	\N	t	\N	2026-01-05 07:24:57.142822+00	\N
1126	16	4	1	GREEN MEDIUM DUSTY	H&M	98-216	\N	t	\N	2026-01-05 07:24:57.153671+00	\N
1127	16	4	3	GREEN DUSTY LIGHT	H&M	98-215	\N	t	\N	2026-01-05 07:24:57.165859+00	\N
1128	16	4	3	GREEN DUSTY LIGHT	H&M	98-213	\N	t	\N	2026-01-05 07:24:57.175469+00	\N
1129	16	4	5	GREEN MEDIUM	H&M	98-212	\N	t	\N	2026-01-05 07:24:57.184419+00	\N
1130	16	4	5	GREEN MEDIUM	H&M	98-211	\N	t	\N	2026-01-05 07:24:57.197038+00	\N
1131	16	4	5	GREEN MEDIUM	H&M	98-210	\N	t	\N	2026-01-05 07:24:57.203349+00	\N
1132	16	4	5	GREEN MEDIUM	H&M	98-209	\N	t	\N	2026-01-05 07:24:57.214395+00	\N
1133	16	4	5	GREEN MEDIUM	H&M	98-208	\N	t	\N	2026-01-05 07:24:57.220701+00	\N
1134	16	4	1	GREEN MEDIUM DUSTY	H&M	98-207	\N	t	\N	2026-01-05 07:24:57.229639+00	\N
1135	16	4	1	GREEN MEDIUM DUSTY	H&M	98-206	\N	t	\N	2026-01-05 07:24:57.23541+00	\N
1136	16	4	5	GREEN MEDIUM	H&M	98-205	\N	t	\N	2026-01-05 07:24:57.244378+00	\N
1137	16	4	5	GREEN MEDIUM	H&M	98-204	\N	t	\N	2026-01-05 07:24:57.251311+00	\N
1138	16	4	1	GREEN MEDIUM DUSTY	H&M	98-203	\N	t	\N	2026-01-05 07:24:57.259688+00	\N
1139	16	4	5	GREEN MEDIUM	H&M	98-202	\N	t	\N	2026-01-05 07:24:57.267267+00	\N
1140	16	4	5	GREEN MEDIUM	H&M	98-201	\N	t	\N	2026-01-05 07:24:57.275553+00	\N
1141	16	4	3	GREEN DUSTY LIGHT	H&M	98-119	\N	t	\N	2026-01-05 07:24:57.282882+00	\N
1142	16	4	1	GREEN MEDIUM DUSTY	H&M	98-118	\N	t	\N	2026-01-05 07:24:57.291838+00	\N
1143	16	4	3	GREEN DUSTY LIGHT	H&M	98-117	\N	t	\N	2026-01-05 07:24:57.298674+00	\N
1144	16	4	1	GREEN MEDIUM DUSTY	H&M	98-115	\N	t	\N	2026-01-05 07:24:57.304198+00	\N
1145	16	4	1	GREEN MEDIUM DUSTY	H&M	98-114	\N	t	\N	2026-01-05 07:24:57.313242+00	\N
1146	16	4	1	GREEN MEDIUM DUSTY	H&M	98-112	\N	t	\N	2026-01-05 07:24:57.320978+00	\N
1147	16	4	3	GREEN DUSTY LIGHT	H&M	98-111	\N	t	\N	2026-01-05 07:24:57.342991+00	\N
1148	16	4	6	GREEN LIGHT	H&M	98-110	\N	t	\N	2026-01-05 07:24:57.355542+00	\N
1149	16	4	3	GREEN DUSTY LIGHT	H&M	98-109	\N	t	\N	2026-01-05 07:24:57.369057+00	\N
1150	16	4	1	GREEN MEDIUM DUSTY	H&M	98-108	\N	t	\N	2026-01-05 07:24:57.380946+00	\N
1151	16	4	3	GREEN DUSTY LIGHT	H&M	98-107	\N	t	\N	2026-01-05 07:24:57.392597+00	\N
1152	16	4	1	GREEN MEDIUM DUSTY	H&M	98-106	\N	t	\N	2026-01-05 07:24:57.401758+00	\N
1153	16	4	3	GREEN DUSTY LIGHT	H&M	98-105	\N	t	\N	2026-01-05 07:24:57.418106+00	\N
1154	16	4	3	GREEN DUSTY LIGHT	H&M	98-104	\N	t	\N	2026-01-05 07:24:57.438315+00	\N
1155	16	4	3	GREEN DUSTY LIGHT	H&M	98-103	\N	t	\N	2026-01-05 07:24:57.450991+00	\N
1156	16	4	4	GREEN BRIGHT	H&M	97-316	\N	t	\N	2026-01-05 07:24:57.458966+00	\N
1157	16	4	4	GREEN BRIGHT	H&M	97-315	\N	t	\N	2026-01-05 07:24:57.465634+00	\N
1158	16	4	4	GREEN BRIGHT	H&M	97-314	\N	t	\N	2026-01-05 07:24:57.471354+00	\N
1159	16	4	6	GREEN LIGHT	H&M	97-312	\N	t	\N	2026-01-05 07:24:57.48054+00	\N
1160	16	4	6	GREEN LIGHT	H&M	97-311	\N	t	\N	2026-01-05 07:24:57.486696+00	\N
1161	16	4	4	GREEN BRIGHT	H&M	97-310	\N	t	\N	2026-01-05 07:24:57.495451+00	\N
1162	16	4	4	GREEN BRIGHT	H&M	97-309	\N	t	\N	2026-01-05 07:24:57.502034+00	\N
1163	16	4	4	GREEN BRIGHT	H&M	97-308	\N	t	\N	2026-01-05 07:24:57.510518+00	\N
1164	16	4	4	GREEN BRIGHT	H&M	97-307	\N	t	\N	2026-01-05 07:24:57.516811+00	\N
1165	16	4	6	GREEN LIGHT	H&M	97-306	\N	t	\N	2026-01-05 07:24:57.526556+00	\N
1166	16	4	6	GREEN LIGHT	H&M	97-305	\N	t	\N	2026-01-05 07:24:57.534666+00	\N
1167	16	4	6	GREEN LIGHT	H&M	97-304	\N	t	\N	2026-01-05 07:24:57.543349+00	\N
1168	16	4	6	GREEN LIGHT	H&M	97-303	\N	t	\N	2026-01-05 07:24:57.550446+00	\N
1169	16	4	6	GREEN LIGHT	H&M	97-302	\N	t	\N	2026-01-05 07:24:57.55987+00	\N
1170	16	4	6	GREEN LIGHT	H&M	97-301	\N	t	\N	2026-01-05 07:24:57.567531+00	\N
1171	16	4	6	GREEN LIGHT	H&M	97-220	\N	t	\N	2026-01-05 07:24:57.576357+00	\N
1172	16	4	6	GREEN LIGHT	H&M	97-219	\N	t	\N	2026-01-05 07:24:57.583924+00	\N
1173	16	4	3	GREEN DUSTY LIGHT	H&M	97-218	\N	t	\N	2026-01-05 07:24:57.593265+00	\N
1174	16	4	3	GREEN DUSTY LIGHT	H&M	97-217	\N	t	\N	2026-01-05 07:24:57.601226+00	\N
1175	16	4	3	GREEN DUSTY LIGHT	H&M	97-216	\N	t	\N	2026-01-05 07:24:57.609663+00	\N
1176	16	4	6	GREEN LIGHT	H&M	97-215	\N	t	\N	2026-01-05 07:24:57.617206+00	\N
1177	16	4	3	GREEN DUSTY LIGHT	H&M	97-214	\N	t	\N	2026-01-05 07:24:57.626445+00	\N
1178	16	4	3	GREEN DUSTY LIGHT	H&M	97-213	\N	t	\N	2026-01-05 07:24:57.633861+00	\N
1179	16	4	3	GREEN DUSTY LIGHT	H&M	97-212	\N	t	\N	2026-01-05 07:24:57.642574+00	\N
1180	16	4	6	GREEN LIGHT	H&M	97-211	\N	t	\N	2026-01-05 07:24:57.649708+00	\N
1181	16	4	6	GREEN LIGHT	H&M	97-210	\N	t	\N	2026-01-05 07:24:57.655754+00	\N
1182	16	4	6	GREEN LIGHT	H&M	97-209	\N	t	\N	2026-01-05 07:24:57.665649+00	\N
1183	16	4	6	GREEN LIGHT	H&M	97-208	\N	t	\N	2026-01-05 07:24:57.671994+00	\N
1184	16	4	6	GREEN LIGHT	H&M	97-207	\N	t	\N	2026-01-05 07:24:57.681542+00	\N
1185	16	4	6	GREEN LIGHT	H&M	97-206	\N	t	\N	2026-01-05 07:24:57.688208+00	\N
1186	16	4	3	GREEN DUSTY LIGHT	H&M	97-205	\N	t	\N	2026-01-05 07:24:57.69844+00	\N
1187	16	4	6	GREEN LIGHT	H&M	97-204	\N	t	\N	2026-01-05 07:24:57.704854+00	\N
1188	16	4	3	GREEN DUSTY LIGHT	H&M	97-203	\N	t	\N	2026-01-05 07:24:57.714424+00	\N
1189	16	4	3	GREEN DUSTY LIGHT	H&M	97-202	\N	t	\N	2026-01-05 07:24:57.721626+00	\N
1190	16	4	6	GREEN LIGHT	H&M	97-201	\N	t	\N	2026-01-05 07:24:57.732053+00	\N
1191	16	4	3	GREEN DUSTY LIGHT	H&M	97-131	\N	t	\N	2026-01-05 07:24:57.738739+00	\N
1192	16	4	3	GREEN DUSTY LIGHT	H&M	97-129	\N	t	\N	2026-01-05 07:24:57.75211+00	\N
1193	16	4	3	GREEN DUSTY LIGHT	H&M	97-128	\N	t	\N	2026-01-05 07:24:57.76801+00	\N
1194	16	4	3	GREEN DUSTY LIGHT	H&M	97-127	\N	t	\N	2026-01-05 07:24:57.781293+00	\N
1195	16	4	3	GREEN DUSTY LIGHT	H&M	97-126	\N	t	\N	2026-01-05 07:24:57.794164+00	\N
1196	16	4	3	GREEN DUSTY LIGHT	H&M	97-125	\N	t	\N	2026-01-05 07:24:57.80292+00	\N
1197	16	4	6	GREEN LIGHT	H&M	97-124	\N	t	\N	2026-01-05 07:24:57.81422+00	\N
1198	16	4	6	GREEN LIGHT	H&M	97-123	\N	t	\N	2026-01-05 07:24:57.824921+00	\N
1199	16	4	3	GREEN DUSTY LIGHT	H&M	97-122	\N	t	\N	2026-01-05 07:24:57.836662+00	\N
1200	16	4	3	GREEN DUSTY LIGHT	H&M	97-121	\N	t	\N	2026-01-05 07:24:57.850878+00	\N
1201	16	4	6	GREEN LIGHT	H&M	97-120	\N	t	\N	2026-01-05 07:24:57.864766+00	\N
1202	16	4	3	GREEN DUSTY LIGHT	H&M	97-119	\N	t	\N	2026-01-05 07:24:57.873326+00	\N
1203	16	4	3	GREEN DUSTY LIGHT	H&M	97-118	\N	t	\N	2026-01-05 07:24:57.886381+00	\N
1204	16	4	6	GREEN LIGHT	H&M	97-117	\N	t	\N	2026-01-05 07:24:57.900677+00	\N
1205	16	4	3	GREEN DUSTY LIGHT	H&M	97-116	\N	t	\N	2026-01-05 07:24:57.916029+00	\N
1206	16	4	3	GREEN DUSTY LIGHT	H&M	97-115	\N	t	\N	2026-01-05 07:24:57.927578+00	\N
1207	16	4	6	GREEN LIGHT	H&M	97-114	\N	t	\N	2026-01-05 07:24:57.937148+00	\N
1208	16	4	6	GREEN LIGHT	H&M	97-113	\N	t	\N	2026-01-05 07:24:57.95031+00	\N
1209	16	4	6	GREEN LIGHT	H&M	97-112	\N	t	\N	2026-01-05 07:24:57.970859+00	\N
1210	16	4	6	GREEN LIGHT	H&M	97-111	\N	t	\N	2026-01-05 07:24:57.983294+00	\N
1211	16	4	3	GREEN DUSTY LIGHT	H&M	97-110	\N	t	\N	2026-01-05 07:24:57.989795+00	\N
1212	16	4	3	GREEN DUSTY LIGHT	H&M	97-109	\N	t	\N	2026-01-05 07:24:57.999724+00	\N
1213	16	4	3	GREEN DUSTY LIGHT	H&M	97-108	\N	t	\N	2026-01-05 07:24:58.006591+00	\N
1214	16	4	3	GREEN DUSTY LIGHT	H&M	97-107	\N	t	\N	2026-01-05 07:24:58.015572+00	\N
1215	16	4	3	GREEN DUSTY LIGHT	H&M	97-106	\N	t	\N	2026-01-05 07:24:58.021707+00	\N
1216	16	4	3	GREEN DUSTY LIGHT	H&M	97-105	\N	t	\N	2026-01-05 07:24:58.030625+00	\N
1217	16	4	3	GREEN DUSTY LIGHT	H&M	97-104	\N	t	\N	2026-01-05 07:24:58.036812+00	\N
1218	16	4	3	GREEN DUSTY LIGHT	H&M	97-103	\N	t	\N	2026-01-05 07:24:58.044189+00	\N
1219	16	4	3	GREEN DUSTY LIGHT	H&M	97-102	\N	t	\N	2026-01-05 07:24:58.051409+00	\N
1220	16	4	3	GREEN DUSTY LIGHT	H&M	97-101	\N	t	\N	2026-01-05 07:24:58.05783+00	\N
1221	16	4	4	GREEN BRIGHT	H&M	96-305	\N	t	\N	2026-01-05 07:24:58.066538+00	\N
1222	16	4	2	GREEN DARK	H&M	96-304	\N	t	\N	2026-01-05 07:24:58.072402+00	\N
1223	16	4	5	GREEN MEDIUM	H&M	96-303	\N	t	\N	2026-01-05 07:24:58.082816+00	\N
1224	16	4	5	GREEN MEDIUM	H&M	96-302	\N	t	\N	2026-01-05 07:24:58.089381+00	\N
1225	16	4	5	GREEN MEDIUM	H&M	96-301	\N	t	\N	2026-01-05 07:24:58.099157+00	\N
1226	16	4	2	GREEN DARK	H&M	96-225	\N	t	\N	2026-01-05 07:24:58.105869+00	\N
1227	16	4	5	GREEN MEDIUM	H&M	96-224	\N	t	\N	2026-01-05 07:24:58.11801+00	\N
1228	16	4	5	GREEN MEDIUM	H&M	96-223	\N	t	\N	2026-01-05 07:24:58.129566+00	\N
1229	16	4	2	GREEN DARK	H&M	96-222	\N	t	\N	2026-01-05 07:24:58.138907+00	\N
1230	16	4	2	GREEN DARK	H&M	96-221	\N	t	\N	2026-01-05 07:24:58.151166+00	\N
1231	16	4	5	GREEN MEDIUM	H&M	96-220	\N	t	\N	2026-01-05 07:24:58.161443+00	\N
1232	16	4	5	GREEN MEDIUM	H&M	96-219	\N	t	\N	2026-01-05 07:24:58.168932+00	\N
1233	16	4	5	GREEN MEDIUM	H&M	96-218	\N	t	\N	2026-01-05 07:24:58.178781+00	\N
1234	16	4	5	GREEN MEDIUM	H&M	96-217	\N	t	\N	2026-01-05 07:24:58.18688+00	\N
1235	16	4	5	GREEN MEDIUM	H&M	96-215	\N	t	\N	2026-01-05 07:24:58.200533+00	\N
1236	16	4	5	GREEN MEDIUM	H&M	96-214	\N	t	\N	2026-01-05 07:24:58.208838+00	\N
1237	16	4	5	GREEN MEDIUM	H&M	96-213	\N	t	\N	2026-01-05 07:24:58.218723+00	\N
1238	16	4	1	GREEN MEDIUM DUSTY	H&M	96-212	\N	t	\N	2026-01-05 07:24:58.226652+00	\N
1239	16	4	2	GREEN DARK	H&M	96-211	\N	t	\N	2026-01-05 07:24:58.233562+00	\N
1240	16	4	1	GREEN MEDIUM DUSTY	H&M	96-210	\N	t	\N	2026-01-05 07:24:58.239404+00	\N
1241	16	4	5	GREEN MEDIUM	H&M	96-208	\N	t	\N	2026-01-05 07:24:58.249345+00	\N
1242	16	4	5	GREEN MEDIUM	H&M	96-207	\N	t	\N	2026-01-05 07:24:58.255976+00	\N
1243	16	4	2	GREEN DARK	H&M	96-206	\N	t	\N	2026-01-05 07:24:58.26571+00	\N
1244	16	4	1	GREEN MEDIUM DUSTY	H&M	96-205	\N	t	\N	2026-01-05 07:24:58.272834+00	\N
1245	16	4	2	GREEN DARK	H&M	96-204	\N	t	\N	2026-01-05 07:24:58.283236+00	\N
1246	16	4	5	GREEN MEDIUM	H&M	96-203	\N	t	\N	2026-01-05 07:24:58.290473+00	\N
1247	16	4	1	GREEN MEDIUM DUSTY	H&M	96-202	\N	t	\N	2026-01-05 07:24:58.301108+00	\N
1248	16	4	5	GREEN MEDIUM	H&M	96-201	\N	t	\N	2026-01-05 07:24:58.310479+00	\N
1249	16	4	2	GREEN DARK	H&M	96-121	\N	t	\N	2026-01-05 07:24:58.317767+00	\N
1250	16	4	2	GREEN DARK	H&M	96-120	\N	t	\N	2026-01-05 07:24:58.325324+00	\N
1251	16	4	2	GREEN DARK	H&M	96-119	\N	t	\N	2026-01-05 07:24:58.334398+00	\N
1252	16	4	2	GREEN DARK	H&M	96-117	\N	t	\N	2026-01-05 07:24:58.342895+00	\N
1253	16	4	1	GREEN MEDIUM DUSTY	H&M	96-116	\N	t	\N	2026-01-05 07:24:58.35099+00	\N
1254	16	4	2	GREEN DARK	H&M	96-115	\N	t	\N	2026-01-05 07:24:58.358999+00	\N
1255	16	4	2	GREEN DARK	H&M	96-113	\N	t	\N	2026-01-05 07:24:58.367966+00	\N
1256	16	4	2	GREEN DARK	H&M	96-112	\N	t	\N	2026-01-05 07:24:58.3775+00	\N
1257	16	4	2	GREEN DARK	H&M	96-111	\N	t	\N	2026-01-05 07:24:58.38532+00	\N
1258	16	4	2	GREEN DARK	H&M	96-110	\N	t	\N	2026-01-05 07:24:58.394265+00	\N
1259	16	4	2	GREEN DARK	H&M	96-109	\N	t	\N	2026-01-05 07:24:58.401786+00	\N
1260	16	4	1	GREEN MEDIUM DUSTY	H&M	96-108	\N	t	\N	2026-01-05 07:24:58.410729+00	\N
1261	16	4	1	GREEN MEDIUM DUSTY	H&M	96-107	\N	t	\N	2026-01-05 07:24:58.418641+00	\N
1262	16	4	2	GREEN DARK	H&M	96-106	\N	t	\N	2026-01-05 07:24:58.42774+00	\N
1263	16	4	1	GREEN MEDIUM DUSTY	H&M	96-105	\N	t	\N	2026-01-05 07:24:58.434883+00	\N
1264	16	4	1	GREEN MEDIUM DUSTY	H&M	96-104	\N	t	\N	2026-01-05 07:24:58.443371+00	\N
1265	16	4	1	GREEN MEDIUM DUSTY	H&M	96-103	\N	t	\N	2026-01-05 07:24:58.451868+00	\N
1266	16	4	2	GREEN DARK	H&M	96-102	\N	t	\N	2026-01-05 07:24:58.46148+00	\N
1267	16	4	4	GREEN BRIGHT	H&M	95-322	\N	t	\N	2026-01-05 07:24:58.46972+00	\N
1268	16	4	5	GREEN MEDIUM	H&M	95-321	\N	t	\N	2026-01-05 07:24:58.478947+00	\N
1269	16	4	4	GREEN BRIGHT	H&M	95-320	\N	t	\N	2026-01-05 07:24:58.486743+00	\N
1270	16	4	4	GREEN BRIGHT	H&M	95-319	\N	t	\N	2026-01-05 07:24:58.494961+00	\N
1271	16	4	4	GREEN BRIGHT	H&M	95-318	\N	t	\N	2026-01-05 07:24:58.501982+00	\N
1272	16	4	4	GREEN BRIGHT	H&M	95-317	\N	t	\N	2026-01-05 07:24:58.511043+00	\N
1273	16	4	4	GREEN BRIGHT	H&M	95-316	\N	t	\N	2026-01-05 07:24:58.518864+00	\N
1274	16	4	4	GREEN BRIGHT	H&M	95-315	\N	t	\N	2026-01-05 07:24:58.527731+00	\N
1275	16	4	4	GREEN BRIGHT	H&M	95-314	\N	t	\N	2026-01-05 07:24:58.535629+00	\N
1276	16	4	4	GREEN BRIGHT	H&M	95-313	\N	t	\N	2026-01-05 07:24:58.544525+00	\N
1277	16	4	4	GREEN BRIGHT	H&M	95-312	\N	t	\N	2026-01-05 07:24:58.551898+00	\N
1278	16	4	4	GREEN BRIGHT	H&M	95-311	\N	t	\N	2026-01-05 07:24:58.561272+00	\N
1279	16	4	4	GREEN BRIGHT	H&M	95-310	\N	t	\N	2026-01-05 07:24:58.568932+00	\N
1280	16	4	4	GREEN BRIGHT	H&M	95-309	\N	t	\N	2026-01-05 07:24:58.57808+00	\N
1281	16	4	5	GREEN MEDIUM	H&M	95-308	\N	t	\N	2026-01-05 07:24:58.585774+00	\N
1282	16	4	4	GREEN BRIGHT	H&M	95-307	\N	t	\N	2026-01-05 07:24:58.59467+00	\N
1283	16	4	4	GREEN BRIGHT	H&M	95-305	\N	t	\N	2026-01-05 07:24:58.602431+00	\N
1284	16	4	4	GREEN BRIGHT	H&M	95-304	\N	t	\N	2026-01-05 07:24:58.611384+00	\N
1285	16	4	4	GREEN BRIGHT	H&M	95-303	\N	t	\N	2026-01-05 07:24:58.618773+00	\N
1286	16	4	4	GREEN BRIGHT	H&M	95-302	\N	t	\N	2026-01-05 07:24:58.627339+00	\N
1287	16	4	5	GREEN MEDIUM	H&M	95-301	\N	t	\N	2026-01-05 07:24:58.635492+00	\N
1288	16	4	4	GREEN BRIGHT	H&M	95-224	\N	t	\N	2026-01-05 07:24:58.645008+00	\N
1289	16	4	5	GREEN MEDIUM	H&M	95-223	\N	t	\N	2026-01-05 07:24:58.653408+00	\N
1290	16	4	4	GREEN BRIGHT	H&M	95-222	\N	t	\N	2026-01-05 07:24:58.66198+00	\N
1291	16	4	5	GREEN MEDIUM	H&M	95-221	\N	t	\N	2026-01-05 07:24:58.669909+00	\N
1292	16	4	6	GREEN LIGHT	H&M	95-220	\N	t	\N	2026-01-05 07:24:58.678477+00	\N
1293	16	4	3	GREEN DUSTY LIGHT	H&M	95-219	\N	t	\N	2026-01-05 07:24:58.686319+00	\N
1294	16	4	6	GREEN LIGHT	H&M	95-218	\N	t	\N	2026-01-05 07:24:58.69496+00	\N
1295	16	4	5	GREEN MEDIUM	H&M	95-217	\N	t	\N	2026-01-05 07:24:58.702446+00	\N
1296	16	4	5	GREEN MEDIUM	H&M	95-216	\N	t	\N	2026-01-05 07:24:58.711541+00	\N
1297	16	4	5	GREEN MEDIUM	H&M	95-215	\N	t	\N	2026-01-05 07:24:58.719245+00	\N
1298	16	4	5	GREEN MEDIUM	H&M	95-214	\N	t	\N	2026-01-05 07:24:58.728089+00	\N
1299	16	4	5	GREEN MEDIUM	H&M	95-213	\N	t	\N	2026-01-05 07:24:58.735635+00	\N
1300	16	4	6	GREEN LIGHT	H&M	95-212	\N	t	\N	2026-01-05 07:24:58.74484+00	\N
1301	16	4	6	GREEN LIGHT	H&M	95-211	\N	t	\N	2026-01-05 07:24:58.75291+00	\N
1302	16	4	4	GREEN BRIGHT	H&M	95-210	\N	t	\N	2026-01-05 07:24:58.761809+00	\N
1303	16	4	4	GREEN BRIGHT	H&M	95-209	\N	t	\N	2026-01-05 07:24:58.769536+00	\N
1304	16	4	5	GREEN MEDIUM	H&M	95-208	\N	t	\N	2026-01-05 07:24:58.778694+00	\N
1305	16	4	6	GREEN LIGHT	H&M	95-207	\N	t	\N	2026-01-05 07:24:58.786634+00	\N
1306	16	4	6	GREEN LIGHT	H&M	95-206	\N	t	\N	2026-01-05 07:24:58.795219+00	\N
1307	16	4	6	GREEN LIGHT	H&M	95-205	\N	t	\N	2026-01-05 07:24:58.802951+00	\N
1308	16	4	6	GREEN LIGHT	H&M	95-204	\N	t	\N	2026-01-05 07:24:58.811783+00	\N
1309	16	4	5	GREEN MEDIUM	H&M	95-202	\N	t	\N	2026-01-05 07:24:58.819819+00	\N
1310	16	4	5	GREEN MEDIUM	H&M	95-201	\N	t	\N	2026-01-05 07:24:58.828888+00	\N
1311	16	4	5	GREEN MEDIUM	H&M	95-117	\N	t	\N	2026-01-05 07:24:58.837314+00	\N
1312	16	4	1	GREEN MEDIUM DUSTY	H&M	95-116	\N	t	\N	2026-01-05 07:24:58.846204+00	\N
1313	16	4	3	GREEN DUSTY LIGHT	H&M	95-115	\N	t	\N	2026-01-05 07:24:58.854087+00	\N
1314	16	4	3	GREEN DUSTY LIGHT	H&M	95-112	\N	t	\N	2026-01-05 07:24:58.862685+00	\N
1315	16	4	3	GREEN DUSTY LIGHT	H&M	95-111	\N	t	\N	2026-01-05 07:24:58.870399+00	\N
1316	16	4	3	GREEN DUSTY LIGHT	H&M	95-108	\N	t	\N	2026-01-05 07:24:58.879301+00	\N
1317	16	4	1	GREEN MEDIUM DUSTY	H&M	95-106	\N	t	\N	2026-01-05 07:24:58.887101+00	\N
1318	16	4	3	GREEN DUSTY LIGHT	H&M	95-103	\N	t	\N	2026-01-05 07:24:58.895565+00	\N
1319	16	4	6	GREEN LIGHT	H&M	94-314	\N	t	\N	2026-01-05 07:24:58.903021+00	\N
1320	16	4	4	GREEN BRIGHT	H&M	94-313	\N	t	\N	2026-01-05 07:24:58.91195+00	\N
1321	16	4	6	GREEN LIGHT	H&M	94-312	\N	t	\N	2026-01-05 07:24:58.919981+00	\N
1322	16	4	4	GREEN BRIGHT	H&M	94-311	\N	t	\N	2026-01-05 07:24:58.929052+00	\N
1323	16	4	6	GREEN LIGHT	H&M	94-309	\N	t	\N	2026-01-05 07:24:58.93665+00	\N
1324	16	4	6	GREEN LIGHT	H&M	94-215	\N	t	\N	2026-01-05 07:24:58.945413+00	\N
1325	16	4	6	GREEN LIGHT	H&M	94-214	\N	t	\N	2026-01-05 07:24:58.953151+00	\N
1326	16	4	3	GREEN DUSTY LIGHT	H&M	94-213	\N	t	\N	2026-01-05 07:24:58.961953+00	\N
1327	16	4	6	GREEN LIGHT	H&M	94-212	\N	t	\N	2026-01-05 07:24:58.96957+00	\N
1328	16	4	6	GREEN LIGHT	H&M	94-211	\N	t	\N	2026-01-05 07:24:58.978708+00	\N
1329	16	4	3	GREEN DUSTY LIGHT	H&M	94-210	\N	t	\N	2026-01-05 07:24:58.986257+00	\N
1330	16	4	3	GREEN DUSTY LIGHT	H&M	94-209	\N	t	\N	2026-01-05 07:24:58.995682+00	\N
1331	16	4	3	GREEN DUSTY LIGHT	H&M	94-208	\N	t	\N	2026-01-05 07:24:59.004184+00	\N
1332	16	4	6	GREEN LIGHT	H&M	94-207	\N	t	\N	2026-01-05 07:24:59.013412+00	\N
1333	16	4	3	GREEN DUSTY LIGHT	H&M	94-206	\N	t	\N	2026-01-05 07:24:59.021549+00	\N
1334	16	4	6	GREEN LIGHT	H&M	94-205	\N	t	\N	2026-01-05 07:24:59.030953+00	\N
1335	16	4	6	GREEN LIGHT	H&M	94-204	\N	t	\N	2026-01-05 07:24:59.038447+00	\N
1336	16	4	6	GREEN LIGHT	H&M	94-203	\N	t	\N	2026-01-05 07:24:59.048227+00	\N
1337	16	4	3	GREEN DUSTY LIGHT	H&M	94-202	\N	t	\N	2026-01-05 07:24:59.055567+00	\N
1338	16	4	3	GREEN DUSTY LIGHT	H&M	94-201	\N	t	\N	2026-01-05 07:24:59.065551+00	\N
1339	16	4	3	GREEN DUSTY LIGHT	H&M	94-129	\N	t	\N	2026-01-05 07:24:59.072753+00	\N
1340	16	4	3	GREEN DUSTY LIGHT	H&M	94-128	\N	t	\N	2026-01-05 07:24:59.082764+00	\N
1341	16	4	3	GREEN DUSTY LIGHT	H&M	94-126	\N	t	\N	2026-01-05 07:24:59.089967+00	\N
1342	16	4	3	GREEN DUSTY LIGHT	H&M	94-125	\N	t	\N	2026-01-05 07:24:59.100584+00	\N
1343	16	4	3	GREEN DUSTY LIGHT	H&M	94-124	\N	t	\N	2026-01-05 07:24:59.107642+00	\N
1344	16	4	3	GREEN DUSTY LIGHT	H&M	94-123	\N	t	\N	2026-01-05 07:24:59.11792+00	\N
1345	16	4	3	GREEN DUSTY LIGHT	H&M	94-122	\N	t	\N	2026-01-05 07:24:59.125679+00	\N
1346	16	4	3	GREEN DUSTY LIGHT	H&M	94-121	\N	t	\N	2026-01-05 07:24:59.136592+00	\N
1347	16	4	3	GREEN DUSTY LIGHT	H&M	94-120	\N	t	\N	2026-01-05 07:24:59.148203+00	\N
1348	16	4	3	GREEN DUSTY LIGHT	H&M	94-119	\N	t	\N	2026-01-05 07:24:59.155583+00	\N
1349	16	4	3	GREEN DUSTY LIGHT	H&M	94-118	\N	t	\N	2026-01-05 07:24:59.164976+00	\N
1350	16	4	3	GREEN DUSTY LIGHT	H&M	94-117	\N	t	\N	2026-01-05 07:24:59.171419+00	\N
1351	16	4	3	GREEN DUSTY LIGHT	H&M	94-116	\N	t	\N	2026-01-05 07:24:59.180784+00	\N
1352	16	4	3	GREEN DUSTY LIGHT	H&M	94-115	\N	t	\N	2026-01-05 07:24:59.189124+00	\N
1353	16	4	3	GREEN DUSTY LIGHT	H&M	94-114	\N	t	\N	2026-01-05 07:24:59.198752+00	\N
1354	16	4	3	GREEN DUSTY LIGHT	H&M	94-113	\N	t	\N	2026-01-05 07:24:59.206195+00	\N
1355	16	4	3	GREEN DUSTY LIGHT	H&M	94-112	\N	t	\N	2026-01-05 07:24:59.215963+00	\N
1356	16	4	3	GREEN DUSTY LIGHT	H&M	94-111	\N	t	\N	2026-01-05 07:24:59.229242+00	\N
1357	16	4	3	GREEN DUSTY LIGHT	H&M	94-110	\N	t	\N	2026-01-05 07:24:59.246806+00	\N
1358	16	4	3	GREEN DUSTY LIGHT	H&M	94-109	\N	t	\N	2026-01-05 07:24:59.254434+00	\N
1359	16	4	3	GREEN DUSTY LIGHT	H&M	94-108	\N	t	\N	2026-01-05 07:24:59.262733+00	\N
1360	16	4	3	GREEN DUSTY LIGHT	H&M	94-107	\N	t	\N	2026-01-05 07:24:59.270322+00	\N
1361	16	4	3	GREEN DUSTY LIGHT	H&M	94-106	\N	t	\N	2026-01-05 07:24:59.279865+00	\N
1362	16	4	3	GREEN DUSTY LIGHT	H&M	94-105	\N	t	\N	2026-01-05 07:24:59.286592+00	\N
1363	16	4	3	GREEN DUSTY LIGHT	H&M	94-104	\N	t	\N	2026-01-05 07:24:59.292246+00	\N
1364	16	4	3	GREEN DUSTY LIGHT	H&M	94-103	\N	t	\N	2026-01-05 07:24:59.301987+00	\N
1365	16	4	3	GREEN DUSTY LIGHT	H&M	94-102	\N	t	\N	2026-01-05 07:24:59.308514+00	\N
1366	16	4	4	GREEN BRIGHT	H&M	93-308	\N	t	\N	2026-01-05 07:24:59.31784+00	\N
1367	16	4	5	GREEN MEDIUM	H&M	93-307	\N	t	\N	2026-01-05 07:24:59.32554+00	\N
1368	16	4	5	GREEN MEDIUM	H&M	93-306	\N	t	\N	2026-01-05 07:24:59.336024+00	\N
1369	16	4	5	GREEN MEDIUM	H&M	93-305	\N	t	\N	2026-01-05 07:24:59.345431+00	\N
1370	16	4	4	GREEN BRIGHT	H&M	93-304	\N	t	\N	2026-01-05 07:24:59.353602+00	\N
1371	16	4	4	GREEN BRIGHT	H&M	93-303	\N	t	\N	2026-01-05 07:24:59.362268+00	\N
1372	16	4	4	GREEN BRIGHT	H&M	93-302	\N	t	\N	2026-01-05 07:24:59.369588+00	\N
1373	16	4	4	GREEN BRIGHT	H&M	93-301	\N	t	\N	2026-01-05 07:24:59.376183+00	\N
1374	16	4	2	GREEN DARK	H&M	93-219	\N	t	\N	2026-01-05 07:24:59.385556+00	\N
1375	16	4	2	GREEN DARK	H&M	93-218	\N	t	\N	2026-01-05 07:24:59.391926+00	\N
1376	16	4	5	GREEN MEDIUM	H&M	93-217	\N	t	\N	2026-01-05 07:24:59.401561+00	\N
1377	16	4	5	GREEN MEDIUM	H&M	93-216	\N	t	\N	2026-01-05 07:24:59.408083+00	\N
1378	16	4	5	GREEN MEDIUM	H&M	93-213	\N	t	\N	2026-01-05 07:24:59.417123+00	\N
1379	16	4	5	GREEN MEDIUM	H&M	93-212	\N	t	\N	2026-01-05 07:24:59.4235+00	\N
1380	16	4	5	GREEN MEDIUM	H&M	93-211	\N	t	\N	2026-01-05 07:24:59.4336+00	\N
1381	16	4	5	GREEN MEDIUM	H&M	93-210	\N	t	\N	2026-01-05 07:24:59.440382+00	\N
1382	16	4	5	GREEN MEDIUM	H&M	93-209	\N	t	\N	2026-01-05 07:24:59.44961+00	\N
1383	16	4	5	GREEN MEDIUM	H&M	93-207	\N	t	\N	2026-01-05 07:24:59.456066+00	\N
1384	16	4	5	GREEN MEDIUM	H&M	93-206	\N	t	\N	2026-01-05 07:24:59.464238+00	\N
1385	16	4	4	GREEN BRIGHT	H&M	93-205	\N	t	\N	2026-01-05 07:24:59.470669+00	\N
1386	16	4	5	GREEN MEDIUM	H&M	93-204	\N	t	\N	2026-01-05 07:24:59.47849+00	\N
1387	16	4	2	GREEN DARK	H&M	93-203	\N	t	\N	2026-01-05 07:24:59.48592+00	\N
1388	16	4	2	GREEN DARK	H&M	93-202	\N	t	\N	2026-01-05 07:24:59.492288+00	\N
1389	16	4	2	GREEN DARK	H&M	93-201	\N	t	\N	2026-01-05 07:24:59.501908+00	\N
1390	16	4	1	GREEN MEDIUM DUSTY	H&M	93-130	\N	t	\N	2026-01-05 07:24:59.508298+00	\N
1391	16	4	2	GREEN DARK	H&M	93-129	\N	t	\N	2026-01-05 07:24:59.518297+00	\N
1392	16	4	2	GREEN DARK	H&M	93-128	\N	t	\N	2026-01-05 07:24:59.524801+00	\N
1393	16	4	2	GREEN DARK	H&M	93-127	\N	t	\N	2026-01-05 07:24:59.533495+00	\N
1394	16	4	2	GREEN DARK	H&M	93-126	\N	t	\N	2026-01-05 07:24:59.539481+00	\N
1395	16	4	2	GREEN DARK	H&M	93-125	\N	t	\N	2026-01-05 07:24:59.54799+00	\N
1396	16	4	2	GREEN DARK	H&M	93-124	\N	t	\N	2026-01-05 07:24:59.554801+00	\N
1397	16	4	2	GREEN DARK	H&M	93-123	\N	t	\N	2026-01-05 07:24:59.56303+00	\N
1398	16	4	2	GREEN DARK	H&M	93-122	\N	t	\N	2026-01-05 07:24:59.57008+00	\N
1399	16	4	2	GREEN DARK	H&M	93-121	\N	t	\N	2026-01-05 07:24:59.5773+00	\N
1400	16	4	5	GREEN MEDIUM	H&M	93-120	\N	t	\N	2026-01-05 07:24:59.585899+00	\N
1401	16	4	1	GREEN MEDIUM DUSTY	H&M	93-118	\N	t	\N	2026-01-05 07:24:59.591679+00	\N
1402	16	4	2	GREEN DARK	H&M	93-117	\N	t	\N	2026-01-05 07:24:59.601916+00	\N
1403	16	4	2	GREEN DARK	H&M	93-115	\N	t	\N	2026-01-05 07:24:59.608221+00	\N
1404	16	4	2	GREEN DARK	H&M	93-114	\N	t	\N	2026-01-05 07:24:59.618149+00	\N
1405	16	4	2	GREEN DARK	H&M	93-113	\N	t	\N	2026-01-05 07:24:59.624419+00	\N
1406	16	4	2	GREEN DARK	H&M	93-112	\N	t	\N	2026-01-05 07:24:59.633478+00	\N
1407	16	4	1	GREEN MEDIUM DUSTY	H&M	93-111	\N	t	\N	2026-01-05 07:24:59.640102+00	\N
1408	16	4	2	GREEN DARK	H&M	93-110	\N	t	\N	2026-01-05 07:24:59.648978+00	\N
1409	16	4	2	GREEN DARK	H&M	93-109	\N	t	\N	2026-01-05 07:24:59.655076+00	\N
1410	16	4	1	GREEN MEDIUM DUSTY	H&M	93-108	\N	t	\N	2026-01-05 07:24:59.663101+00	\N
1411	16	4	1	GREEN MEDIUM DUSTY	H&M	93-107	\N	t	\N	2026-01-05 07:24:59.670075+00	\N
1412	16	4	2	GREEN DARK	H&M	93-106	\N	t	\N	2026-01-05 07:24:59.677098+00	\N
1413	16	4	1	GREEN MEDIUM DUSTY	H&M	93-105	\N	t	\N	2026-01-05 07:24:59.685726+00	\N
1414	16	4	1	GREEN MEDIUM DUSTY	H&M	93-104	\N	t	\N	2026-01-05 07:24:59.691959+00	\N
1415	16	4	1	GREEN MEDIUM DUSTY	H&M	93-103	\N	t	\N	2026-01-05 07:24:59.702171+00	\N
1416	16	4	1	GREEN MEDIUM DUSTY	H&M	93-102	\N	t	\N	2026-01-05 07:24:59.708813+00	\N
1417	16	4	1	GREEN MEDIUM DUSTY	H&M	93-101	\N	t	\N	2026-01-05 07:24:59.717573+00	\N
1418	16	4	4	GREEN BRIGHT	H&M	92-308	\N	t	\N	2026-01-05 07:24:59.72338+00	\N
1419	16	4	4	GREEN BRIGHT	H&M	92-307	\N	t	\N	2026-01-05 07:24:59.732113+00	\N
1420	16	4	4	GREEN BRIGHT	H&M	92-306	\N	t	\N	2026-01-05 07:24:59.738798+00	\N
1421	16	4	4	GREEN BRIGHT	H&M	92-305	\N	t	\N	2026-01-05 07:24:59.746689+00	\N
1422	16	4	4	GREEN BRIGHT	H&M	92-304	\N	t	\N	2026-01-05 07:24:59.75799+00	\N
1423	16	4	4	GREEN BRIGHT	H&M	92-303	\N	t	\N	2026-01-05 07:24:59.774443+00	\N
1424	16	4	4	GREEN BRIGHT	H&M	92-302	\N	t	\N	2026-01-05 07:24:59.785991+00	\N
1425	16	4	4	GREEN BRIGHT	H&M	92-301	\N	t	\N	2026-01-05 07:24:59.793016+00	\N
1426	16	4	5	GREEN MEDIUM	H&M	92-226	\N	t	\N	2026-01-05 07:24:59.804889+00	\N
1427	16	4	5	GREEN MEDIUM	H&M	92-225	\N	t	\N	2026-01-05 07:24:59.813967+00	\N
1428	16	4	6	GREEN LIGHT	H&M	92-224	\N	t	\N	2026-01-05 07:24:59.821758+00	\N
1429	16	4	6	GREEN LIGHT	H&M	92-222	\N	t	\N	2026-01-05 07:24:59.830712+00	\N
1430	16	4	6	GREEN LIGHT	H&M	92-221	\N	t	\N	2026-01-05 07:24:59.838338+00	\N
1431	16	4	6	GREEN LIGHT	H&M	92-220	\N	t	\N	2026-01-05 07:24:59.847449+00	\N
1432	16	4	3	GREEN DUSTY LIGHT	H&M	92-217	\N	t	\N	2026-01-05 07:24:59.855448+00	\N
1433	16	4	4	GREEN BRIGHT	H&M	92-216	\N	t	\N	2026-01-05 07:24:59.865471+00	\N
1434	16	4	3	GREEN DUSTY LIGHT	H&M	92-215	\N	t	\N	2026-01-05 07:24:59.873237+00	\N
1435	16	4	4	GREEN BRIGHT	H&M	92-214	\N	t	\N	2026-01-05 07:24:59.883926+00	\N
1436	16	4	6	GREEN LIGHT	H&M	92-213	\N	t	\N	2026-01-05 07:24:59.892009+00	\N
1437	16	4	6	GREEN LIGHT	H&M	92-212	\N	t	\N	2026-01-05 07:24:59.902944+00	\N
1438	16	4	4	GREEN BRIGHT	H&M	92-211	\N	t	\N	2026-01-05 07:24:59.912971+00	\N
1439	16	4	5	GREEN MEDIUM	H&M	92-209	\N	t	\N	2026-01-05 07:24:59.921526+00	\N
1440	16	4	5	GREEN MEDIUM	H&M	92-208	\N	t	\N	2026-01-05 07:24:59.930813+00	\N
1441	16	4	5	GREEN MEDIUM	H&M	92-207	\N	t	\N	2026-01-05 07:24:59.9388+00	\N
1442	16	4	4	GREEN BRIGHT	H&M	92-206	\N	t	\N	2026-01-05 07:24:59.947505+00	\N
1443	16	4	4	GREEN BRIGHT	H&M	92-205	\N	t	\N	2026-01-05 07:24:59.955062+00	\N
1444	16	4	6	GREEN LIGHT	H&M	92-204	\N	t	\N	2026-01-05 07:24:59.964112+00	\N
1445	16	4	6	GREEN LIGHT	H&M	92-203	\N	t	\N	2026-01-05 07:24:59.971694+00	\N
1446	16	4	5	GREEN MEDIUM	H&M	92-202	\N	t	\N	2026-01-05 07:24:59.980672+00	\N
1447	16	4	6	GREEN LIGHT	H&M	92-201	\N	t	\N	2026-01-05 07:24:59.989009+00	\N
1448	16	4	3	GREEN DUSTY LIGHT	H&M	92-113	\N	t	\N	2026-01-05 07:24:59.998242+00	\N
1449	16	4	1	GREEN MEDIUM DUSTY	H&M	92-112	\N	t	\N	2026-01-05 07:25:00.005899+00	\N
1450	16	4	5	GREEN MEDIUM	H&M	92-111	\N	t	\N	2026-01-05 07:25:00.017434+00	\N
1451	16	4	3	GREEN DUSTY LIGHT	H&M	92-110	\N	t	\N	2026-01-05 07:25:00.028893+00	\N
1452	16	4	1	GREEN MEDIUM DUSTY	H&M	92-109	\N	t	\N	2026-01-05 07:25:00.04104+00	\N
1453	16	4	3	GREEN DUSTY LIGHT	H&M	92-108	\N	t	\N	2026-01-05 07:25:00.055332+00	\N
1454	16	4	3	GREEN DUSTY LIGHT	H&M	92-107	\N	t	\N	2026-01-05 07:25:00.070071+00	\N
1455	16	4	3	GREEN DUSTY LIGHT	H&M	92-106	\N	t	\N	2026-01-05 07:25:00.080549+00	\N
1456	16	4	3	GREEN DUSTY LIGHT	H&M	92-105	\N	t	\N	2026-01-05 07:25:00.089267+00	\N
1457	16	4	3	GREEN DUSTY LIGHT	H&M	92-104	\N	t	\N	2026-01-05 07:25:00.099945+00	\N
1458	16	4	1	GREEN MEDIUM DUSTY	H&M	92-103	\N	t	\N	2026-01-05 07:25:00.107307+00	\N
1459	16	4	1	GREEN MEDIUM DUSTY	H&M	92-102	\N	t	\N	2026-01-05 07:25:00.118896+00	\N
1460	16	4	6	GREEN LIGHT	H&M	91-309	\N	t	\N	2026-01-05 07:25:00.126352+00	\N
1461	16	4	6	GREEN LIGHT	H&M	91-308	\N	t	\N	2026-01-05 07:25:00.137943+00	\N
1462	16	4	6	GREEN LIGHT	H&M	91-307	\N	t	\N	2026-01-05 07:25:00.155545+00	\N
1463	16	4	6	GREEN LIGHT	H&M	91-306	\N	t	\N	2026-01-05 07:25:00.169671+00	\N
1464	16	4	6	GREEN LIGHT	H&M	91-305	\N	t	\N	2026-01-05 07:25:00.180119+00	\N
1465	16	4	6	GREEN LIGHT	H&M	91-304	\N	t	\N	2026-01-05 07:25:00.192972+00	\N
1466	16	4	6	GREEN LIGHT	H&M	91-303	\N	t	\N	2026-01-05 07:25:00.208205+00	\N
1467	16	4	6	GREEN LIGHT	H&M	91-302	\N	t	\N	2026-01-05 07:25:00.219536+00	\N
1468	16	4	6	GREEN LIGHT	H&M	91-301	\N	t	\N	2026-01-05 07:25:00.2284+00	\N
1469	16	4	6	GREEN LIGHT	H&M	91-216	\N	t	\N	2026-01-05 07:25:00.238179+00	\N
1470	16	4	6	GREEN LIGHT	H&M	91-214	\N	t	\N	2026-01-05 07:25:00.247672+00	\N
1471	16	4	3	GREEN DUSTY LIGHT	H&M	91-213	\N	t	\N	2026-01-05 07:25:00.255359+00	\N
1472	16	4	6	GREEN LIGHT	H&M	91-212	\N	t	\N	2026-01-05 07:25:00.265017+00	\N
1473	16	4	3	GREEN DUSTY LIGHT	H&M	91-211	\N	t	\N	2026-01-05 07:25:00.272567+00	\N
1474	16	4	6	GREEN LIGHT	H&M	91-210	\N	t	\N	2026-01-05 07:25:00.281827+00	\N
1475	16	4	6	GREEN LIGHT	H&M	91-209	\N	t	\N	2026-01-05 07:25:00.289952+00	\N
1476	16	4	6	GREEN LIGHT	H&M	91-208	\N	t	\N	2026-01-05 07:25:00.300579+00	\N
1477	16	4	6	GREEN LIGHT	H&M	91-207	\N	t	\N	2026-01-05 07:25:00.307041+00	\N
1478	16	4	6	GREEN LIGHT	H&M	91-206	\N	t	\N	2026-01-05 07:25:00.316407+00	\N
1479	16	4	6	GREEN LIGHT	H&M	91-205	\N	t	\N	2026-01-05 07:25:00.323186+00	\N
1480	16	4	6	GREEN LIGHT	H&M	91-204	\N	t	\N	2026-01-05 07:25:00.336224+00	\N
1481	16	4	6	GREEN LIGHT	H&M	91-203	\N	t	\N	2026-01-05 07:25:00.342835+00	\N
1482	16	4	6	GREEN LIGHT	H&M	91-202	\N	t	\N	2026-01-05 07:25:00.353392+00	\N
1483	16	4	3	GREEN DUSTY LIGHT	H&M	91-201	\N	t	\N	2026-01-05 07:25:00.363681+00	\N
1484	16	4	3	GREEN DUSTY LIGHT	H&M	91-109	\N	t	\N	2026-01-05 07:25:00.37219+00	\N
1485	16	4	3	GREEN DUSTY LIGHT	H&M	91-108	\N	t	\N	2026-01-05 07:25:00.380713+00	\N
1486	16	4	3	GREEN DUSTY LIGHT	H&M	91-107	\N	t	\N	2026-01-05 07:25:00.388177+00	\N
1487	16	4	3	GREEN DUSTY LIGHT	H&M	91-106	\N	t	\N	2026-01-05 07:25:00.397686+00	\N
1488	16	4	3	GREEN DUSTY LIGHT	H&M	91-105	\N	t	\N	2026-01-05 07:25:00.405844+00	\N
1489	16	4	3	GREEN DUSTY LIGHT	H&M	91-104	\N	t	\N	2026-01-05 07:25:00.414537+00	\N
1490	16	4	3	GREEN DUSTY LIGHT	H&M	91-103	\N	t	\N	2026-01-05 07:25:00.421738+00	\N
1491	16	4	3	GREEN DUSTY LIGHT	H&M	91-102	\N	t	\N	2026-01-05 07:25:00.430714+00	\N
1492	16	4	3	GREEN DUSTY LIGHT	H&M	91-101	\N	t	\N	2026-01-05 07:25:00.438179+00	\N
1493	16	4	4	GREEN BRIGHT	H&M	90-306	\N	t	\N	2026-01-05 07:25:00.449072+00	\N
1494	16	4	4	GREEN BRIGHT	H&M	90-111	\N	t	\N	2026-01-05 07:25:00.457049+00	\N
1495	16	4	4	GREEN BRIGHT	H&M	90-110	\N	t	\N	2026-01-05 07:25:00.467109+00	\N
1496	16	4	4	GREEN BRIGHT	H&M	90-108	\N	t	\N	2026-01-05 07:25:00.473695+00	\N
1497	16	4	4	GREEN BRIGHT	H&M	90-107	\N	t	\N	2026-01-05 07:25:00.48266+00	\N
1498	16	4	4	GREEN BRIGHT	H&M	90-105	\N	t	\N	2026-01-05 07:25:00.489462+00	\N
1499	16	4	4	GREEN BRIGHT	H&M	90-104	\N	t	\N	2026-01-05 07:25:00.498065+00	\N
1500	16	4	6	GREEN LIGHT	H&M	90-103	\N	t	\N	2026-01-05 07:25:00.505036+00	\N
1501	16	4	6	GREEN LIGHT	H&M	90-102	\N	t	\N	2026-01-05 07:25:00.514058+00	\N
1502	16	4	4	GREEN BRIGHT	H&M	90-101	\N	t	\N	2026-01-05 07:25:00.521392+00	\N
1503	16	4	4	GREEN BRIGHT	H&M	89-308	\N	t	\N	2026-01-05 07:25:00.528442+00	\N
1504	16	4	4	GREEN BRIGHT	H&M	89-305	\N	t	\N	2026-01-05 07:25:00.53769+00	\N
1505	16	4	4	GREEN BRIGHT	H&M	89-304	\N	t	\N	2026-01-05 07:25:00.545039+00	\N
1506	16	4	4	GREEN BRIGHT	H&M	89-303	\N	t	\N	2026-01-05 07:25:00.554422+00	\N
1507	16	4	5	GREEN MEDIUM	H&M	89-302	\N	t	\N	2026-01-05 07:25:00.561869+00	\N
1508	16	4	5	GREEN MEDIUM	H&M	89-221	\N	t	\N	2026-01-05 07:25:00.571003+00	\N
1509	16	4	5	GREEN MEDIUM	H&M	89-220	\N	t	\N	2026-01-05 07:25:00.580013+00	\N
1510	16	4	1	GREEN MEDIUM DUSTY	H&M	89-219	\N	t	\N	2026-01-05 07:25:00.589185+00	\N
1511	16	4	5	GREEN MEDIUM	H&M	89-217	\N	t	\N	2026-01-05 07:25:00.597905+00	\N
1512	16	4	5	GREEN MEDIUM	H&M	89-216	\N	t	\N	2026-01-05 07:25:00.605388+00	\N
1513	16	4	5	GREEN MEDIUM	H&M	89-215	\N	t	\N	2026-01-05 07:25:00.616303+00	\N
1514	16	4	5	GREEN MEDIUM	H&M	89-214	\N	t	\N	2026-01-05 07:25:00.623533+00	\N
1515	16	4	5	GREEN MEDIUM	H&M	89-213	\N	t	\N	2026-01-05 07:25:00.632508+00	\N
1516	16	4	1	GREEN MEDIUM DUSTY	H&M	89-212	\N	t	\N	2026-01-05 07:25:00.64799+00	\N
1517	16	4	5	GREEN MEDIUM	H&M	89-211	\N	t	\N	2026-01-05 07:25:00.658624+00	\N
1518	16	4	5	GREEN MEDIUM	H&M	89-210	\N	t	\N	2026-01-05 07:25:00.670619+00	\N
1519	16	4	5	GREEN MEDIUM	H&M	89-209	\N	t	\N	2026-01-05 07:25:00.677735+00	\N
1520	16	4	1	GREEN MEDIUM DUSTY	H&M	89-203	\N	t	\N	2026-01-05 07:25:00.687793+00	\N
1521	16	4	5	GREEN MEDIUM	H&M	89-202	\N	t	\N	2026-01-05 07:25:00.694412+00	\N
1522	16	4	5	GREEN MEDIUM	H&M	89-201	\N	t	\N	2026-01-05 07:25:00.706618+00	\N
1523	16	4	2	GREEN DARK	H&M	89-118	\N	t	\N	2026-01-05 07:25:00.717218+00	\N
1524	16	4	2	GREEN DARK	H&M	89-116	\N	t	\N	2026-01-05 07:25:00.723863+00	\N
1525	16	4	2	GREEN DARK	H&M	89-115	\N	t	\N	2026-01-05 07:25:00.732766+00	\N
1526	16	4	2	GREEN DARK	H&M	89-112	\N	t	\N	2026-01-05 07:25:00.739712+00	\N
1527	16	4	1	GREEN MEDIUM DUSTY	H&M	89-110	\N	t	\N	2026-01-05 07:25:00.75027+00	\N
1528	16	4	1	GREEN MEDIUM DUSTY	H&M	89-109	\N	t	\N	2026-01-05 07:25:00.759409+00	\N
1529	16	4	2	GREEN DARK	H&M	89-102	\N	t	\N	2026-01-05 07:25:00.769285+00	\N
1530	16	4	6	GREEN LIGHT	H&M	88-209	\N	t	\N	2026-01-05 07:25:00.776368+00	\N
1531	16	4	3	GREEN DUSTY LIGHT	H&M	88-206	\N	t	\N	2026-01-05 07:25:00.789718+00	\N
1532	16	4	1	GREEN MEDIUM DUSTY	H&M	88-116	\N	t	\N	2026-01-05 07:25:00.800266+00	\N
1533	16	4	1	GREEN MEDIUM DUSTY	H&M	88-114	\N	t	\N	2026-01-05 07:25:00.807815+00	\N
1534	16	4	1	GREEN MEDIUM DUSTY	H&M	88-111	\N	t	\N	2026-01-05 07:25:00.822777+00	\N
1535	16	4	3	GREEN DUSTY LIGHT	H&M	88-101	\N	t	\N	2026-01-05 07:25:00.838471+00	\N
1536	16	4	3	GREEN DUSTY LIGHT	H&M	87-124	\N	t	\N	2026-01-05 07:25:00.851639+00	\N
1537	16	4	3	GREEN DUSTY LIGHT	H&M	87-116	\N	t	\N	2026-01-05 07:25:00.864282+00	\N
1538	16	4	3	GREEN DUSTY LIGHT	H&M	87-114	\N	t	\N	2026-01-05 07:25:00.886549+00	\N
1539	16	4	3	GREEN DUSTY LIGHT	H&M	87-113	\N	t	\N	2026-01-05 07:25:00.902234+00	\N
1540	16	4	3	GREEN DUSTY LIGHT	H&M	87-112	\N	t	\N	2026-01-05 07:25:00.916109+00	\N
1541	16	4	2	GREEN DARK	H&M	86-211	\N	t	\N	2026-01-05 07:25:00.936861+00	\N
1542	16	4	1	GREEN MEDIUM DUSTY	H&M	86-210	\N	t	\N	2026-01-05 07:25:00.948349+00	\N
1543	16	4	2	GREEN DARK	H&M	79-125	\N	t	\N	2026-01-05 07:25:00.962207+00	\N
1544	16	4	5	GREEN MEDIUM	H&M	23-306	\N	t	\N	2026-01-05 07:25:00.977559+00	\N
1545	16	4	5	GREEN MEDIUM	H&M	23-305	\N	t	\N	2026-01-05 07:25:00.99416+00	\N
1546	16	4	5	GREEN MEDIUM	H&M	23-302	\N	t	\N	2026-01-05 07:25:01.010421+00	\N
1547	16	4	5	GREEN MEDIUM	H&M	23-209	\N	t	\N	2026-01-05 07:25:01.027132+00	\N
1548	16	4	5	GREEN MEDIUM	H&M	23-207	\N	t	\N	2026-01-05 07:25:01.044074+00	\N
1549	16	4	5	GREEN MEDIUM	H&M	23-204	\N	t	\N	2026-01-05 07:25:01.060429+00	\N
1550	16	4	4	GREEN BRIGHT	H&M	22-309	\N	t	\N	2026-01-05 07:25:01.076649+00	\N
1551	16	4	5	GREEN MEDIUM	H&M	22-304	\N	t	\N	2026-01-05 07:25:01.093658+00	\N
1552	16	4	1	GREEN MEDIUM DUSTY	H&M	22-221	\N	t	\N	2026-01-05 07:25:01.112766+00	\N
1553	16	4	5	GREEN MEDIUM	H&M	22-218	\N	t	\N	2026-01-05 07:25:01.135349+00	\N
1554	16	4	5	GREEN MEDIUM	H&M	22-217	\N	t	\N	2026-01-05 07:25:01.155208+00	\N
1555	16	4	5	GREEN MEDIUM	H&M	22-214	\N	t	\N	2026-01-05 07:25:01.171134+00	\N
1556	16	4	5	GREEN MEDIUM	H&M	22-213	\N	t	\N	2026-01-05 07:25:01.183558+00	\N
1557	16	4	6	GREEN LIGHT	H&M	22-211	\N	t	\N	2026-01-05 07:25:01.204794+00	\N
1558	16	4	3	GREEN DUSTY LIGHT	H&M	22-104	\N	t	\N	2026-01-05 07:25:01.220235+00	\N
1559	16	4	3	GREEN DUSTY LIGHT	H&M	22-101	\N	t	\N	2026-01-05 07:25:01.238135+00	\N
1560	16	4	4	GREEN BRIGHT	H&M	21-304	\N	t	\N	2026-01-05 07:25:01.25076+00	\N
1561	16	4	6	GREEN LIGHT	H&M	21-214	\N	t	\N	2026-01-05 07:25:01.270876+00	\N
1562	16	4	6	GREEN LIGHT	H&M	21-207	\N	t	\N	2026-01-05 07:25:01.293833+00	\N
1563	16	4	6	GREEN LIGHT	H&M	21-204	\N	t	\N	2026-01-05 07:25:01.322109+00	\N
1564	16	4	6	GREEN LIGHT	H&M	21-203	\N	t	\N	2026-01-05 07:25:01.334283+00	\N
1565	16	4	2	GREEN DARK	H&M	09-102	\N	t	\N	2026-01-05 07:25:01.350739+00	\N
1566	17	9	1	GREY MEDIUM DUSTY	H&M	93-119	\N	t	\N	2026-01-05 07:25:01.366548+00	\N
1567	17	9	3	GREY DUSTY LIGHT	H&M	91-110	\N	t	\N	2026-01-05 07:25:01.387538+00	\N
1568	17	9	3	GREY DUSTY LIGHT	H&M	87-123	\N	t	\N	2026-01-05 07:25:01.405996+00	\N
1569	17	9	3	GREY DUSTY LIGHT	H&M	87-122	\N	t	\N	2026-01-05 07:25:01.424181+00	\N
1570	17	9	1	GREY MEDIUM DUSTY	H&M	82-101	\N	t	\N	2026-01-05 07:25:01.442974+00	\N
1571	17	9	1	GREY MEDIUM DUSTY	H&M	76-122	\N	t	\N	2026-01-05 07:25:01.471768+00	\N
1572	17	9	1	GREY MEDIUM DUSTY	H&M	73-104	\N	t	\N	2026-01-05 07:25:01.490801+00	\N
1573	17	9	1	GREY MEDIUM DUSTY	H&M	69-111	\N	t	\N	2026-01-05 07:25:01.508028+00	\N
1574	17	9	1	GREY MEDIUM DUSTY	H&M	68-109	\N	t	\N	2026-01-05 07:25:01.526282+00	\N
1575	17	9	2	GREY DARK	H&M	63-111	\N	t	\N	2026-01-05 07:25:01.543635+00	\N
1576	17	9	3	GREY DUSTY LIGHT	H&M	16-239	\N	t	\N	2026-01-05 07:25:01.560789+00	\N
1577	17	9	2	GREY DARK	H&M	15-206	\N	t	\N	2026-01-05 07:25:01.582095+00	\N
1578	17	9	2	GREY DARK	H&M	15-202	\N	t	\N	2026-01-05 07:25:01.599996+00	\N
1579	17	9	2	GREY DARK	H&M	15-105	\N	t	\N	2026-01-05 07:25:01.617313+00	\N
1580	17	9	2	GREY DARK	H&M	09-199	\N	t	\N	2026-01-05 07:25:01.640186+00	\N
1581	17	9	2	GREY DARK	H&M	08-306	\N	t	\N	2026-01-05 07:25:01.661335+00	\N
1582	17	9	2	GREY DARK	H&M	08-305	\N	t	\N	2026-01-05 07:25:01.682728+00	\N
1583	17	9	2	GREY DARK	H&M	08-303	\N	t	\N	2026-01-05 07:25:01.7003+00	\N
1584	17	9	2	GREY DARK	H&M	08-302	\N	t	\N	2026-01-05 07:25:01.716846+00	\N
1585	17	9	2	GREY DARK	H&M	08-301	\N	t	\N	2026-01-05 07:25:01.733851+00	\N
1586	17	9	2	GREY DARK	H&M	08-237	\N	t	\N	2026-01-05 07:25:01.750073+00	\N
1587	17	9	2	GREY DARK	H&M	08-236	\N	t	\N	2026-01-05 07:25:01.766566+00	\N
1588	17	9	1	GREY MEDIUM DUSTY	H&M	08-234	\N	t	\N	2026-01-05 07:25:01.784128+00	\N
1589	17	9	1	GREY MEDIUM DUSTY	H&M	08-233	\N	t	\N	2026-01-05 07:25:01.801906+00	\N
1590	17	9	2	GREY DARK	H&M	08-232	\N	t	\N	2026-01-05 07:25:01.811568+00	\N
1591	17	9	2	GREY DARK	H&M	08-231	\N	t	\N	2026-01-05 07:25:01.825275+00	\N
1592	17	9	2	GREY DARK	H&M	08-230	\N	t	\N	2026-01-05 07:25:01.838803+00	\N
1593	17	9	2	GREY DARK	H&M	08-229	\N	t	\N	2026-01-05 07:25:01.848423+00	\N
1594	17	9	2	GREY DARK	H&M	08-228	\N	t	\N	2026-01-05 07:25:01.859995+00	\N
1595	17	9	2	GREY DARK	H&M	08-227	\N	t	\N	2026-01-05 07:25:01.87393+00	\N
1596	17	9	2	GREY DARK	H&M	08-226	\N	t	\N	2026-01-05 07:25:01.88406+00	\N
1597	17	9	2	GREY DARK	H&M	08-225	\N	t	\N	2026-01-05 07:25:01.893401+00	\N
1598	17	9	2	GREY DARK	H&M	08-224	\N	t	\N	2026-01-05 07:25:01.906925+00	\N
1599	17	9	1	GREY MEDIUM DUSTY	H&M	08-223	\N	t	\N	2026-01-05 07:25:01.91573+00	\N
1600	17	9	2	GREY DARK	H&M	08-222	\N	t	\N	2026-01-05 07:25:01.9233+00	\N
1601	17	9	2	GREY DARK	H&M	08-221	\N	t	\N	2026-01-05 07:25:01.932569+00	\N
1602	17	9	2	GREY DARK	H&M	08-219	\N	t	\N	2026-01-05 07:25:01.939956+00	\N
1603	17	9	2	GREY DARK	H&M	08-218	\N	t	\N	2026-01-05 07:25:01.948974+00	\N
1604	17	9	1	GREY MEDIUM DUSTY	H&M	08-217	\N	t	\N	2026-01-05 07:25:01.956453+00	\N
1605	17	9	2	GREY DARK	H&M	08-216	\N	t	\N	2026-01-05 07:25:01.965135+00	\N
1606	17	9	1	GREY MEDIUM DUSTY	H&M	08-215	\N	t	\N	2026-01-05 07:25:01.973033+00	\N
1607	17	9	1	GREY MEDIUM DUSTY	H&M	08-214	\N	t	\N	2026-01-05 07:25:01.982511+00	\N
1608	17	9	1	GREY MEDIUM DUSTY	H&M	08-213	\N	t	\N	2026-01-05 07:25:01.989367+00	\N
1609	17	9	1	GREY MEDIUM DUSTY	H&M	08-212	\N	t	\N	2026-01-05 07:25:01.998381+00	\N
1610	17	9	1	GREY MEDIUM DUSTY	H&M	08-211	\N	t	\N	2026-01-05 07:25:02.006279+00	\N
1611	17	9	2	GREY DARK	H&M	08-210	\N	t	\N	2026-01-05 07:25:02.015418+00	\N
1612	17	9	2	GREY DARK	H&M	08-209	\N	t	\N	2026-01-05 07:25:02.02326+00	\N
1613	17	9	2	GREY DARK	H&M	08-208	\N	t	\N	2026-01-05 07:25:02.032279+00	\N
1614	17	9	2	GREY DARK	H&M	08-207	\N	t	\N	2026-01-05 07:25:02.039834+00	\N
1615	17	9	2	GREY DARK	H&M	08-206	\N	t	\N	2026-01-05 07:25:02.048787+00	\N
1616	17	9	2	GREY DARK	H&M	08-204	\N	t	\N	2026-01-05 07:25:02.056359+00	\N
1617	17	9	2	GREY DARK	H&M	08-202	\N	t	\N	2026-01-05 07:25:02.065365+00	\N
1618	17	9	2	GREY DARK	H&M	08-201	\N	t	\N	2026-01-05 07:25:02.073115+00	\N
1619	17	9	1	GREY MEDIUM DUSTY	H&M	08-199	\N	t	\N	2026-01-05 07:25:02.081766+00	\N
1620	17	9	2	GREY DARK	H&M	08-198	\N	t	\N	2026-01-05 07:25:02.089704+00	\N
1621	17	9	2	GREY DARK	H&M	08-197	\N	t	\N	2026-01-05 07:25:02.098352+00	\N
1622	17	9	1	GREY MEDIUM DUSTY	H&M	08-117	\N	t	\N	2026-01-05 07:25:02.106405+00	\N
1623	17	9	2	GREY DARK	H&M	08-116	\N	t	\N	2026-01-05 07:25:02.115121+00	\N
1624	17	9	2	GREY DARK	H&M	08-115	\N	t	\N	2026-01-05 07:25:02.123081+00	\N
1625	17	9	2	GREY DARK	H&M	08-114	\N	t	\N	2026-01-05 07:25:02.131908+00	\N
1626	17	9	2	GREY DARK	H&M	08-113	\N	t	\N	2026-01-05 07:25:02.139931+00	\N
1627	17	9	2	GREY DARK	H&M	08-112	\N	t	\N	2026-01-05 07:25:02.148817+00	\N
1628	17	9	2	GREY DARK	H&M	08-111	\N	t	\N	2026-01-05 07:25:02.15664+00	\N
1629	17	9	2	GREY DARK	H&M	08-110	\N	t	\N	2026-01-05 07:25:02.166518+00	\N
1630	17	9	2	GREY DARK	H&M	08-109	\N	t	\N	2026-01-05 07:25:02.173998+00	\N
1631	17	9	2	GREY DARK	H&M	08-108	\N	t	\N	2026-01-05 07:25:02.183355+00	\N
1632	17	9	2	GREY DARK	H&M	08-107	\N	t	\N	2026-01-05 07:25:02.191+00	\N
1633	17	9	2	GREY DARK	H&M	08-106	\N	t	\N	2026-01-05 07:25:02.199992+00	\N
1634	17	9	2	GREY DARK	H&M	08-105	\N	t	\N	2026-01-05 07:25:02.207396+00	\N
1635	17	9	2	GREY DARK	H&M	08-104	\N	t	\N	2026-01-05 07:25:02.216178+00	\N
1636	17	9	2	GREY DARK	H&M	08-103	\N	t	\N	2026-01-05 07:25:02.223407+00	\N
1637	17	9	2	GREY DARK	H&M	08-102	\N	t	\N	2026-01-05 07:25:02.232119+00	\N
1638	17	9	2	GREY DARK	H&M	08-101	\N	t	\N	2026-01-05 07:25:02.240149+00	\N
1639	17	9	1	GREY MEDIUM DUSTY	H&M	07-318	\N	t	\N	2026-01-05 07:25:02.249237+00	\N
1640	17	9	2	GREY DARK	H&M	07-317	\N	t	\N	2026-01-05 07:25:02.256855+00	\N
1641	17	9	1	GREY MEDIUM DUSTY	H&M	07-316	\N	t	\N	2026-01-05 07:25:02.265033+00	\N
1642	17	9	1	GREY MEDIUM DUSTY	H&M	07-315	\N	t	\N	2026-01-05 07:25:02.273009+00	\N
1643	17	9	1	GREY MEDIUM DUSTY	H&M	07-314	\N	t	\N	2026-01-05 07:25:02.281078+00	\N
1644	17	9	2	GREY DARK	H&M	07-313	\N	t	\N	2026-01-05 07:25:02.289759+00	\N
1645	17	9	2	GREY DARK	H&M	07-312	\N	t	\N	2026-01-05 07:25:02.297535+00	\N
1646	17	9	1	GREY MEDIUM DUSTY	H&M	07-311	\N	t	\N	2026-01-05 07:25:02.306221+00	\N
1647	17	9	1	GREY MEDIUM DUSTY	H&M	07-310	\N	t	\N	2026-01-05 07:25:02.312523+00	\N
1648	17	9	1	GREY MEDIUM DUSTY	H&M	07-309	\N	t	\N	2026-01-05 07:25:02.323754+00	\N
1649	17	9	2	GREY DARK	H&M	07-308	\N	t	\N	2026-01-05 07:25:02.334697+00	\N
1650	17	9	1	GREY MEDIUM DUSTY	H&M	07-307	\N	t	\N	2026-01-05 07:25:02.344084+00	\N
1651	17	9	1	GREY MEDIUM DUSTY	H&M	07-306	\N	t	\N	2026-01-05 07:25:02.355928+00	\N
1652	17	9	3	GREY DUSTY LIGHT	H&M	07-305	\N	t	\N	2026-01-05 07:25:02.364537+00	\N
1653	17	9	1	GREY MEDIUM DUSTY	H&M	07-304	\N	t	\N	2026-01-05 07:25:02.3743+00	\N
1654	17	9	1	GREY MEDIUM DUSTY	H&M	07-303	\N	t	\N	2026-01-05 07:25:02.383869+00	\N
1655	17	9	1	GREY MEDIUM DUSTY	H&M	07-302	\N	t	\N	2026-01-05 07:25:02.391877+00	\N
1656	17	9	1	GREY MEDIUM DUSTY	H&M	07-301	\N	t	\N	2026-01-05 07:25:02.406353+00	\N
1657	17	9	1	GREY MEDIUM DUSTY	H&M	07-237	\N	t	\N	2026-01-05 07:25:02.415918+00	\N
1658	17	9	1	GREY MEDIUM DUSTY	H&M	07-236	\N	t	\N	2026-01-05 07:25:02.423867+00	\N
1659	17	9	1	GREY MEDIUM DUSTY	H&M	07-235	\N	t	\N	2026-01-05 07:25:02.442105+00	\N
1660	17	9	1	GREY MEDIUM DUSTY	H&M	07-234	\N	t	\N	2026-01-05 07:25:02.457865+00	\N
1661	17	9	1	GREY MEDIUM DUSTY	H&M	07-232	\N	t	\N	2026-01-05 07:25:02.482833+00	\N
1662	17	9	1	GREY MEDIUM DUSTY	H&M	07-231	\N	t	\N	2026-01-05 07:25:02.493948+00	\N
1663	17	9	1	GREY MEDIUM DUSTY	H&M	07-230	\N	t	\N	2026-01-05 07:25:02.509853+00	\N
1664	17	9	1	GREY MEDIUM DUSTY	H&M	07-229	\N	t	\N	2026-01-05 07:25:02.536819+00	\N
1665	17	9	1	GREY MEDIUM DUSTY	H&M	07-228	\N	t	\N	2026-01-05 07:25:02.54568+00	\N
1666	17	9	1	GREY MEDIUM DUSTY	H&M	07-227	\N	t	\N	2026-01-05 07:25:02.555535+00	\N
1667	17	9	1	GREY MEDIUM DUSTY	H&M	07-226	\N	t	\N	2026-01-05 07:25:02.561258+00	\N
1668	17	9	1	GREY MEDIUM DUSTY	H&M	07-225	\N	t	\N	2026-01-05 07:25:02.570105+00	\N
1669	17	9	1	GREY MEDIUM DUSTY	H&M	07-224	\N	t	\N	2026-01-05 07:25:02.575872+00	\N
1670	17	9	1	GREY MEDIUM DUSTY	H&M	07-223	\N	t	\N	2026-01-05 07:25:02.583487+00	\N
1671	17	9	1	GREY MEDIUM DUSTY	H&M	07-222	\N	t	\N	2026-01-05 07:25:02.589691+00	\N
1672	17	9	1	GREY MEDIUM DUSTY	H&M	07-221	\N	t	\N	2026-01-05 07:25:02.595323+00	\N
1673	17	9	1	GREY MEDIUM DUSTY	H&M	07-220	\N	t	\N	2026-01-05 07:25:02.604519+00	\N
1674	17	9	1	GREY MEDIUM DUSTY	H&M	07-218	\N	t	\N	2026-01-05 07:25:02.610791+00	\N
1675	17	9	1	GREY MEDIUM DUSTY	H&M	07-217	\N	t	\N	2026-01-05 07:25:02.620117+00	\N
1676	17	9	1	GREY MEDIUM DUSTY	H&M	07-216	\N	t	\N	2026-01-05 07:25:02.626214+00	\N
1677	17	9	1	GREY MEDIUM DUSTY	H&M	07-215	\N	t	\N	2026-01-05 07:25:02.636591+00	\N
1678	17	9	1	GREY MEDIUM DUSTY	H&M	07-214	\N	t	\N	2026-01-05 07:25:02.64317+00	\N
1679	17	9	1	GREY MEDIUM DUSTY	H&M	07-213	\N	t	\N	2026-01-05 07:25:02.653123+00	\N
1680	17	9	1	GREY MEDIUM DUSTY	H&M	07-212	\N	t	\N	2026-01-05 07:25:02.659497+00	\N
1681	17	9	1	GREY MEDIUM DUSTY	H&M	07-211	\N	t	\N	2026-01-05 07:25:02.66875+00	\N
1682	17	9	1	GREY MEDIUM DUSTY	H&M	07-210	\N	t	\N	2026-01-05 07:25:02.676082+00	\N
1683	17	9	1	GREY MEDIUM DUSTY	H&M	07-209	\N	t	\N	2026-01-05 07:25:02.685818+00	\N
1684	17	9	1	GREY MEDIUM DUSTY	H&M	07-208	\N	t	\N	2026-01-05 07:25:02.693979+00	\N
1685	17	9	1	GREY MEDIUM DUSTY	H&M	07-207	\N	t	\N	2026-01-05 07:25:02.704085+00	\N
1686	17	9	1	GREY MEDIUM DUSTY	H&M	07-206	\N	t	\N	2026-01-05 07:25:02.710827+00	\N
1687	17	9	1	GREY MEDIUM DUSTY	H&M	07-205	\N	t	\N	2026-01-05 07:25:02.720877+00	\N
1688	17	9	3	GREY DUSTY LIGHT	H&M	07-204	\N	t	\N	2026-01-05 07:25:02.727588+00	\N
1689	17	9	1	GREY MEDIUM DUSTY	H&M	07-203	\N	t	\N	2026-01-05 07:25:02.737135+00	\N
1690	17	9	1	GREY MEDIUM DUSTY	H&M	07-202	\N	t	\N	2026-01-05 07:25:02.743764+00	\N
1691	17	9	1	GREY MEDIUM DUSTY	H&M	07-201	\N	t	\N	2026-01-05 07:25:02.753595+00	\N
1692	17	9	3	GREY DUSTY LIGHT	H&M	07-199	\N	t	\N	2026-01-05 07:25:02.760329+00	\N
1693	17	9	3	GREY DUSTY LIGHT	H&M	07-198	\N	t	\N	2026-01-05 07:25:02.770034+00	\N
1694	17	9	3	GREY DUSTY LIGHT	H&M	07-197	\N	t	\N	2026-01-05 07:25:02.777139+00	\N
1695	17	9	3	GREY DUSTY LIGHT	H&M	07-196	\N	t	\N	2026-01-05 07:25:02.786725+00	\N
1696	17	9	3	GREY DUSTY LIGHT	H&M	07-195	\N	t	\N	2026-01-05 07:25:02.793684+00	\N
1697	17	9	1	GREY MEDIUM DUSTY	H&M	07-194	\N	t	\N	2026-01-05 07:25:02.803062+00	\N
1698	17	9	3	GREY DUSTY LIGHT	H&M	07-115	\N	t	\N	2026-01-05 07:25:02.809518+00	\N
1699	17	9	1	GREY MEDIUM DUSTY	H&M	07-114	\N	t	\N	2026-01-05 07:25:02.818301+00	\N
1700	17	9	1	GREY MEDIUM DUSTY	H&M	07-113	\N	t	\N	2026-01-05 07:25:02.825564+00	\N
1701	17	9	1	GREY MEDIUM DUSTY	H&M	07-112	\N	t	\N	2026-01-05 07:25:02.834705+00	\N
1702	17	9	2	GREY DARK	H&M	07-111	\N	t	\N	2026-01-05 07:25:02.841739+00	\N
1703	17	9	1	GREY MEDIUM DUSTY	H&M	07-110	\N	t	\N	2026-01-05 07:25:02.850657+00	\N
1704	17	9	3	GREY DUSTY LIGHT	H&M	07-108	\N	t	\N	2026-01-05 07:25:02.857776+00	\N
1705	17	9	1	GREY MEDIUM DUSTY	H&M	07-107	\N	t	\N	2026-01-05 07:25:02.866174+00	\N
1706	17	9	1	GREY MEDIUM DUSTY	H&M	07-105	\N	t	\N	2026-01-05 07:25:02.874474+00	\N
1707	17	9	1	GREY MEDIUM DUSTY	H&M	07-104	\N	t	\N	2026-01-05 07:25:02.883417+00	\N
1708	17	9	1	GREY MEDIUM DUSTY	H&M	07-103	\N	t	\N	2026-01-05 07:25:02.89044+00	\N
1709	17	9	2	GREY DARK	H&M	07-102	\N	t	\N	2026-01-05 07:25:02.898476+00	\N
1710	17	9	1	GREY MEDIUM DUSTY	H&M	07-101	\N	t	\N	2026-01-05 07:25:02.906529+00	\N
1711	17	9	3	GREY DUSTY LIGHT	H&M	06-319	\N	t	\N	2026-01-05 07:25:02.914149+00	\N
1712	17	9	3	GREY DUSTY LIGHT	H&M	06-318	\N	t	\N	2026-01-05 07:25:02.923059+00	\N
1713	17	9	3	GREY DUSTY LIGHT	H&M	06-316	\N	t	\N	2026-01-05 07:25:02.930214+00	\N
1714	17	9	3	GREY DUSTY LIGHT	H&M	06-315	\N	t	\N	2026-01-05 07:25:02.939649+00	\N
1715	17	9	3	GREY DUSTY LIGHT	H&M	06-314	\N	t	\N	2026-01-05 07:25:02.946478+00	\N
1716	17	9	3	GREY DUSTY LIGHT	H&M	06-313	\N	t	\N	2026-01-05 07:25:02.956417+00	\N
1717	17	9	3	GREY DUSTY LIGHT	H&M	06-312	\N	t	\N	2026-01-05 07:25:02.962849+00	\N
1718	17	9	3	GREY DUSTY LIGHT	H&M	06-311	\N	t	\N	2026-01-05 07:25:02.972358+00	\N
1719	17	9	3	GREY DUSTY LIGHT	H&M	06-310	\N	t	\N	2026-01-05 07:25:02.97865+00	\N
1720	17	9	3	GREY DUSTY LIGHT	H&M	06-309	\N	t	\N	2026-01-05 07:25:02.988948+00	\N
1721	17	9	3	GREY DUSTY LIGHT	H&M	06-308	\N	t	\N	2026-01-05 07:25:02.99567+00	\N
1722	17	9	3	GREY DUSTY LIGHT	H&M	06-307	\N	t	\N	2026-01-05 07:25:03.005564+00	\N
1723	17	9	1	GREY MEDIUM DUSTY	H&M	06-306	\N	t	\N	2026-01-05 07:25:03.012459+00	\N
1724	17	9	1	GREY MEDIUM DUSTY	H&M	06-305	\N	t	\N	2026-01-05 07:25:03.022607+00	\N
1725	17	9	3	GREY DUSTY LIGHT	H&M	06-304	\N	t	\N	2026-01-05 07:25:03.029916+00	\N
1726	17	9	3	GREY DUSTY LIGHT	H&M	06-303	\N	t	\N	2026-01-05 07:25:03.039676+00	\N
1727	17	9	3	GREY DUSTY LIGHT	H&M	06-302	\N	t	\N	2026-01-05 07:25:03.046707+00	\N
1728	17	9	3	GREY DUSTY LIGHT	H&M	06-301	\N	t	\N	2026-01-05 07:25:03.056423+00	\N
1729	17	9	3	GREY DUSTY LIGHT	H&M	06-229	\N	t	\N	2026-01-05 07:25:03.063685+00	\N
1730	17	9	3	GREY DUSTY LIGHT	H&M	06-228	\N	t	\N	2026-01-05 07:25:03.073141+00	\N
1731	17	9	3	GREY DUSTY LIGHT	H&M	06-227	\N	t	\N	2026-01-05 07:25:03.079791+00	\N
1732	17	9	3	GREY DUSTY LIGHT	H&M	06-226	\N	t	\N	2026-01-05 07:25:03.089454+00	\N
1733	17	9	3	GREY DUSTY LIGHT	H&M	06-225	\N	t	\N	2026-01-05 07:25:03.09636+00	\N
1734	17	9	3	GREY DUSTY LIGHT	H&M	06-224	\N	t	\N	2026-01-05 07:25:03.106413+00	\N
1735	17	9	1	GREY MEDIUM DUSTY	H&M	06-223	\N	t	\N	2026-01-05 07:25:03.113474+00	\N
1736	17	9	1	GREY MEDIUM DUSTY	H&M	06-222	\N	t	\N	2026-01-05 07:25:03.122952+00	\N
1737	17	9	3	GREY DUSTY LIGHT	H&M	06-221	\N	t	\N	2026-01-05 07:25:03.129533+00	\N
1738	17	9	3	GREY DUSTY LIGHT	H&M	06-220	\N	t	\N	2026-01-05 07:25:03.139647+00	\N
1739	17	9	3	GREY DUSTY LIGHT	H&M	06-219	\N	t	\N	2026-01-05 07:25:03.1462+00	\N
1740	17	9	3	GREY DUSTY LIGHT	H&M	06-218	\N	t	\N	2026-01-05 07:25:03.156355+00	\N
1741	17	9	3	GREY DUSTY LIGHT	H&M	06-217	\N	t	\N	2026-01-05 07:25:03.163456+00	\N
1742	17	9	3	GREY DUSTY LIGHT	H&M	06-216	\N	t	\N	2026-01-05 07:25:03.173054+00	\N
1743	17	9	3	GREY DUSTY LIGHT	H&M	06-215	\N	t	\N	2026-01-05 07:25:03.180795+00	\N
1744	17	9	3	GREY DUSTY LIGHT	H&M	06-214	\N	t	\N	2026-01-05 07:25:03.191518+00	\N
1745	17	9	3	GREY DUSTY LIGHT	H&M	06-213	\N	t	\N	2026-01-05 07:25:03.200056+00	\N
1746	17	9	3	GREY DUSTY LIGHT	H&M	06-212	\N	t	\N	2026-01-05 07:25:03.208384+00	\N
1747	17	9	3	GREY DUSTY LIGHT	H&M	06-211	\N	t	\N	2026-01-05 07:25:03.217458+00	\N
1748	17	9	3	GREY DUSTY LIGHT	H&M	06-210	\N	t	\N	2026-01-05 07:25:03.224925+00	\N
1749	17	9	3	GREY DUSTY LIGHT	H&M	06-209	\N	t	\N	2026-01-05 07:25:03.233955+00	\N
1750	17	9	3	GREY DUSTY LIGHT	H&M	06-208	\N	t	\N	2026-01-05 07:25:03.241489+00	\N
1751	17	9	3	GREY DUSTY LIGHT	H&M	06-207	\N	t	\N	2026-01-05 07:25:03.250354+00	\N
1752	17	9	3	GREY DUSTY LIGHT	H&M	06-206	\N	t	\N	2026-01-05 07:25:03.257878+00	\N
1753	17	9	3	GREY DUSTY LIGHT	H&M	06-205	\N	t	\N	2026-01-05 07:25:03.266645+00	\N
1754	17	9	3	GREY DUSTY LIGHT	H&M	06-204	\N	t	\N	2026-01-05 07:25:03.274487+00	\N
1755	17	9	3	GREY DUSTY LIGHT	H&M	06-203	\N	t	\N	2026-01-05 07:25:03.281416+00	\N
1756	17	9	3	GREY DUSTY LIGHT	H&M	06-202	\N	t	\N	2026-01-05 07:25:03.290188+00	\N
1757	17	9	3	GREY DUSTY LIGHT	H&M	06-201	\N	t	\N	2026-01-05 07:25:03.296588+00	\N
1758	17	9	3	GREY DUSTY LIGHT	H&M	06-198	\N	t	\N	2026-01-05 07:25:03.306945+00	\N
1759	17	9	3	GREY DUSTY LIGHT	H&M	06-197	\N	t	\N	2026-01-05 07:25:03.317204+00	\N
1760	17	9	3	GREY DUSTY LIGHT	H&M	06-114	\N	t	\N	2026-01-05 07:25:03.32444+00	\N
1761	17	9	3	GREY DUSTY LIGHT	H&M	06-113	\N	t	\N	2026-01-05 07:25:03.333346+00	\N
1762	17	9	3	GREY DUSTY LIGHT	H&M	06-112	\N	t	\N	2026-01-05 07:25:03.340936+00	\N
1763	17	9	3	GREY DUSTY LIGHT	H&M	06-111	\N	t	\N	2026-01-05 07:25:03.350228+00	\N
1764	17	9	3	GREY DUSTY LIGHT	H&M	06-109	\N	t	\N	2026-01-05 07:25:03.35841+00	\N
1765	17	9	3	GREY DUSTY LIGHT	H&M	06-108	\N	t	\N	2026-01-05 07:25:03.368598+00	\N
1766	17	9	3	GREY DUSTY LIGHT	H&M	06-107	\N	t	\N	2026-01-05 07:25:03.37556+00	\N
1767	17	9	3	GREY DUSTY LIGHT	H&M	06-106	\N	t	\N	2026-01-05 07:25:03.383581+00	\N
1768	17	9	3	GREY DUSTY LIGHT	H&M	06-104	\N	t	\N	2026-01-05 07:25:03.391862+00	\N
1769	17	9	3	GREY DUSTY LIGHT	H&M	06-103	\N	t	\N	2026-01-05 07:25:03.400776+00	\N
1770	17	9	3	GREY DUSTY LIGHT	H&M	06-102	\N	t	\N	2026-01-05 07:25:03.40804+00	\N
1771	17	9	3	GREY DUSTY LIGHT	H&M	06-101	\N	t	\N	2026-01-05 07:25:03.41685+00	\N
1772	18	10	2	KHAKI GREEN DARK	H&M	99-234	\N	t	\N	2026-01-05 07:25:03.424212+00	\N
1773	18	10	2	KHAKI GREEN DARK	H&M	99-104	\N	t	\N	2026-01-05 07:25:03.434038+00	\N
1774	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	98-238	\N	t	\N	2026-01-05 07:25:03.441513+00	\N
1775	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	98-101	\N	t	\N	2026-01-05 07:25:03.45052+00	\N
1776	18	10	2	KHAKI GREEN DARK	H&M	96-114	\N	t	\N	2026-01-05 07:25:03.457848+00	\N
1777	18	10	2	KHAKI GREEN DARK	H&M	96-101	\N	t	\N	2026-01-05 07:25:03.467276+00	\N
1778	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	95-118	\N	t	\N	2026-01-05 07:25:03.474698+00	\N
1779	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	95-110	\N	t	\N	2026-01-05 07:25:03.482954+00	\N
1780	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	95-107	\N	t	\N	2026-01-05 07:25:03.49068+00	\N
1781	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	95-105	\N	t	\N	2026-01-05 07:25:03.499796+00	\N
1782	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	95-104	\N	t	\N	2026-01-05 07:25:03.507392+00	\N
1783	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	95-102	\N	t	\N	2026-01-05 07:25:03.515834+00	\N
1784	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	95-101	\N	t	\N	2026-01-05 07:25:03.52399+00	\N
1785	18	10	2	KHAKI GREEN DARK	H&M	23-208	\N	t	\N	2026-01-05 07:25:03.531212+00	\N
1786	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	23-205	\N	t	\N	2026-01-05 07:25:03.540844+00	\N
1787	18	10	2	KHAKI GREEN DARK	H&M	23-202	\N	t	\N	2026-01-05 07:25:03.547911+00	\N
1788	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	22-216	\N	t	\N	2026-01-05 07:25:03.557081+00	\N
1789	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-317	\N	t	\N	2026-01-05 07:25:03.564405+00	\N
1790	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	19-316	\N	t	\N	2026-01-05 07:25:03.573537+00	\N
1791	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	19-312	\N	t	\N	2026-01-05 07:25:03.580696+00	\N
1792	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	19-310	\N	t	\N	2026-01-05 07:25:03.59015+00	\N
1793	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	19-308	\N	t	\N	2026-01-05 07:25:03.598728+00	\N
1794	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	19-306	\N	t	\N	2026-01-05 07:25:03.60689+00	\N
1795	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	19-305	\N	t	\N	2026-01-05 07:25:03.613539+00	\N
1796	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	19-304	\N	t	\N	2026-01-05 07:25:03.622949+00	\N
1797	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	19-303	\N	t	\N	2026-01-05 07:25:03.629339+00	\N
1798	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-232	\N	t	\N	2026-01-05 07:25:03.639041+00	\N
1799	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-231	\N	t	\N	2026-01-05 07:25:03.645867+00	\N
1800	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-230	\N	t	\N	2026-01-05 07:25:03.655753+00	\N
1801	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-229	\N	t	\N	2026-01-05 07:25:03.66249+00	\N
1802	18	10	2	KHAKI GREEN DARK	H&M	19-228	\N	t	\N	2026-01-05 07:25:03.672187+00	\N
1803	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-227	\N	t	\N	2026-01-05 07:25:03.678743+00	\N
1804	18	10	2	KHAKI GREEN DARK	H&M	19-226	\N	t	\N	2026-01-05 07:25:03.690682+00	\N
1805	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-225	\N	t	\N	2026-01-05 07:25:03.705669+00	\N
1806	18	10	2	KHAKI GREEN DARK	H&M	19-224	\N	t	\N	2026-01-05 07:25:03.716158+00	\N
1807	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-223	\N	t	\N	2026-01-05 07:25:03.724834+00	\N
1808	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-222	\N	t	\N	2026-01-05 07:25:03.733831+00	\N
1809	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-221	\N	t	\N	2026-01-05 07:25:03.741188+00	\N
1810	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-220	\N	t	\N	2026-01-05 07:25:03.750177+00	\N
1811	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-219	\N	t	\N	2026-01-05 07:25:03.757607+00	\N
1812	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-217	\N	t	\N	2026-01-05 07:25:03.766188+00	\N
1813	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-216	\N	t	\N	2026-01-05 07:25:03.774045+00	\N
1814	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-215	\N	t	\N	2026-01-05 07:25:03.782655+00	\N
1815	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-214	\N	t	\N	2026-01-05 07:25:03.790624+00	\N
1816	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-213	\N	t	\N	2026-01-05 07:25:03.797594+00	\N
1817	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	19-212	\N	t	\N	2026-01-05 07:25:03.807042+00	\N
1818	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-211	\N	t	\N	2026-01-05 07:25:03.813928+00	\N
1819	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-210	\N	t	\N	2026-01-05 07:25:03.823778+00	\N
1820	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-209	\N	t	\N	2026-01-05 07:25:03.830983+00	\N
1821	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-208	\N	t	\N	2026-01-05 07:25:03.840392+00	\N
1822	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-207	\N	t	\N	2026-01-05 07:25:03.848366+00	\N
1823	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	19-206	\N	t	\N	2026-01-05 07:25:03.857312+00	\N
1824	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-205	\N	t	\N	2026-01-05 07:25:03.865348+00	\N
1825	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-204	\N	t	\N	2026-01-05 07:25:03.873965+00	\N
1826	18	10	2	KHAKI GREEN DARK	H&M	19-203	\N	t	\N	2026-01-05 07:25:03.881939+00	\N
1827	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-202	\N	t	\N	2026-01-05 07:25:03.890792+00	\N
1828	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-201	\N	t	\N	2026-01-05 07:25:03.899812+00	\N
1829	18	10	2	KHAKI GREEN DARK	H&M	19-141	\N	t	\N	2026-01-05 07:25:03.907803+00	\N
1830	18	10	2	KHAKI GREEN DARK	H&M	19-140	\N	t	\N	2026-01-05 07:25:03.916954+00	\N
1831	18	10	2	KHAKI GREEN DARK	H&M	19-139	\N	t	\N	2026-01-05 07:25:03.924779+00	\N
1832	18	10	2	KHAKI GREEN DARK	H&M	19-138	\N	t	\N	2026-01-05 07:25:03.933467+00	\N
1833	18	10	2	KHAKI GREEN DARK	H&M	19-137	\N	t	\N	2026-01-05 07:25:03.94105+00	\N
1834	18	10	2	KHAKI GREEN DARK	H&M	19-136	\N	t	\N	2026-01-05 07:25:03.950061+00	\N
1835	18	10	2	KHAKI GREEN DARK	H&M	19-135	\N	t	\N	2026-01-05 07:25:03.95772+00	\N
1836	18	10	2	KHAKI GREEN DARK	H&M	19-134	\N	t	\N	2026-01-05 07:25:03.966096+00	\N
1837	18	10	2	KHAKI GREEN DARK	H&M	19-133	\N	t	\N	2026-01-05 07:25:03.974283+00	\N
1838	18	10	2	KHAKI GREEN DARK	H&M	19-132	\N	t	\N	2026-01-05 07:25:03.982322+00	\N
1839	18	10	2	KHAKI GREEN DARK	H&M	19-131	\N	t	\N	2026-01-05 07:25:03.990452+00	\N
1840	18	10	2	KHAKI GREEN DARK	H&M	19-130	\N	t	\N	2026-01-05 07:25:03.996576+00	\N
1841	18	10	2	KHAKI GREEN DARK	H&M	19-129	\N	t	\N	2026-01-05 07:25:04.006533+00	\N
1842	18	10	2	KHAKI GREEN DARK	H&M	19-128	\N	t	\N	2026-01-05 07:25:04.013482+00	\N
1843	18	10	2	KHAKI GREEN DARK	H&M	19-127	\N	t	\N	2026-01-05 07:25:04.023663+00	\N
1844	18	10	2	KHAKI GREEN DARK	H&M	19-126	\N	t	\N	2026-01-05 07:25:04.030549+00	\N
1845	18	10	2	KHAKI GREEN DARK	H&M	19-125	\N	t	\N	2026-01-05 07:25:04.040357+00	\N
1846	18	10	2	KHAKI GREEN DARK	H&M	19-124	\N	t	\N	2026-01-05 07:25:04.046747+00	\N
1847	18	10	2	KHAKI GREEN DARK	H&M	19-123	\N	t	\N	2026-01-05 07:25:04.056662+00	\N
1848	18	10	2	KHAKI GREEN DARK	H&M	19-122	\N	t	\N	2026-01-05 07:25:04.063443+00	\N
1849	18	10	2	KHAKI GREEN DARK	H&M	19-121	\N	t	\N	2026-01-05 07:25:04.073251+00	\N
1850	18	10	2	KHAKI GREEN DARK	H&M	19-120	\N	t	\N	2026-01-05 07:25:04.080814+00	\N
1851	18	10	2	KHAKI GREEN DARK	H&M	19-119	\N	t	\N	2026-01-05 07:25:04.090823+00	\N
1852	18	10	2	KHAKI GREEN DARK	H&M	19-118	\N	t	\N	2026-01-05 07:25:04.099887+00	\N
1853	18	10	2	KHAKI GREEN DARK	H&M	19-117	\N	t	\N	2026-01-05 07:25:04.107596+00	\N
1854	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	19-116	\N	t	\N	2026-01-05 07:25:04.117888+00	\N
1855	18	10	2	KHAKI GREEN DARK	H&M	19-114	\N	t	\N	2026-01-05 07:25:04.12533+00	\N
1856	18	10	2	KHAKI GREEN DARK	H&M	19-113	\N	t	\N	2026-01-05 07:25:04.133739+00	\N
1857	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	19-112	\N	t	\N	2026-01-05 07:25:04.14152+00	\N
1858	18	10	2	KHAKI GREEN DARK	H&M	19-111	\N	t	\N	2026-01-05 07:25:04.149614+00	\N
1859	18	10	2	KHAKI GREEN DARK	H&M	19-110	\N	t	\N	2026-01-05 07:25:04.158169+00	\N
1860	18	10	2	KHAKI GREEN DARK	H&M	19-109	\N	t	\N	2026-01-05 07:25:04.166704+00	\N
1861	18	10	2	KHAKI GREEN DARK	H&M	19-108	\N	t	\N	2026-01-05 07:25:04.175007+00	\N
1862	18	10	2	KHAKI GREEN DARK	H&M	19-107	\N	t	\N	2026-01-05 07:25:04.184387+00	\N
1863	18	10	2	KHAKI GREEN DARK	H&M	19-106	\N	t	\N	2026-01-05 07:25:04.191996+00	\N
1864	18	10	2	KHAKI GREEN DARK	H&M	19-105	\N	t	\N	2026-01-05 07:25:04.201422+00	\N
1865	18	10	2	KHAKI GREEN DARK	H&M	19-101	\N	t	\N	2026-01-05 07:25:04.209439+00	\N
1866	18	10	2	KHAKI GREEN DARK	H&M	15-213	\N	t	\N	2026-01-05 07:25:04.219839+00	\N
1867	18	10	2	KHAKI GREEN DARK	H&M	15-211	\N	t	\N	2026-01-05 07:25:04.227503+00	\N
1868	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	14-212	\N	t	\N	2026-01-05 07:25:04.238899+00	\N
1869	18	10	2	KHAKI GREEN DARK	H&M	14-205	\N	t	\N	2026-01-05 07:25:04.24658+00	\N
1870	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	14-204	\N	t	\N	2026-01-05 07:25:04.258596+00	\N
1871	18	10	1	KHAKI GREEN MEDIUM DUSTY	H&M	14-201	\N	t	\N	2026-01-05 07:25:04.268251+00	\N
1872	18	10	3	KHAKI GREEN DUSTY LIGHT	H&M	13-223	\N	t	\N	2026-01-05 07:25:04.277441+00	\N
1873	19	11	2	LILAC PURPLE DARK	H&M	73-108	\N	t	\N	2026-01-05 07:25:04.288256+00	\N
1874	19	11	2	LILAC PURPLE DARK	H&M	73-107	\N	t	\N	2026-01-05 07:25:04.29886+00	\N
1875	19	11	2	LILAC PURPLE DARK	H&M	73-102	\N	t	\N	2026-01-05 07:25:04.308577+00	\N
1876	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	73-101	\N	t	\N	2026-01-05 07:25:04.318214+00	\N
1877	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	72-210	\N	t	\N	2026-01-05 07:25:04.326235+00	\N
1878	19	11	5	LILAC PURPLE MEDIUM	H&M	72-205	\N	t	\N	2026-01-05 07:25:04.339072+00	\N
1879	19	11	6	LILAC PURPLE LIGHT	H&M	72-203	\N	t	\N	2026-01-05 07:25:04.350695+00	\N
1880	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	72-105	\N	t	\N	2026-01-05 07:25:04.358803+00	\N
1881	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	72-104	\N	t	\N	2026-01-05 07:25:04.368466+00	\N
1882	19	11	6	LILAC PURPLE LIGHT	H&M	71-301	\N	t	\N	2026-01-05 07:25:04.37627+00	\N
1883	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	71-206	\N	t	\N	2026-01-05 07:25:04.386119+00	\N
1884	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	71-201	\N	t	\N	2026-01-05 07:25:04.393707+00	\N
1885	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	71-107	\N	t	\N	2026-01-05 07:25:04.405157+00	\N
1886	19	11	4	LILAC PURPLE BRIGHT	H&M	70-310	\N	t	\N	2026-01-05 07:25:04.412529+00	\N
1887	19	11	5	LILAC PURPLE MEDIUM	H&M	69-323	\N	t	\N	2026-01-05 07:25:04.427208+00	\N
1888	19	11	2	LILAC PURPLE DARK	H&M	69-322	\N	t	\N	2026-01-05 07:25:04.442174+00	\N
1889	19	11	4	LILAC PURPLE BRIGHT	H&M	69-321	\N	t	\N	2026-01-05 07:25:04.456811+00	\N
1890	19	11	4	LILAC PURPLE BRIGHT	H&M	69-319	\N	t	\N	2026-01-05 07:25:04.467386+00	\N
1891	19	11	2	LILAC PURPLE DARK	H&M	69-318	\N	t	\N	2026-01-05 07:25:04.477867+00	\N
1892	19	11	4	LILAC PURPLE BRIGHT	H&M	69-317	\N	t	\N	2026-01-05 07:25:04.489941+00	\N
1893	19	11	2	LILAC PURPLE DARK	H&M	69-316	\N	t	\N	2026-01-05 07:25:04.501231+00	\N
1894	19	11	5	LILAC PURPLE MEDIUM	H&M	69-315	\N	t	\N	2026-01-05 07:25:04.511346+00	\N
1895	19	11	5	LILAC PURPLE MEDIUM	H&M	69-314	\N	t	\N	2026-01-05 07:25:04.522683+00	\N
1896	19	11	2	LILAC PURPLE DARK	H&M	69-313	\N	t	\N	2026-01-05 07:25:04.531561+00	\N
1897	19	11	4	LILAC PURPLE BRIGHT	H&M	69-312	\N	t	\N	2026-01-05 07:25:04.542313+00	\N
1898	19	11	4	LILAC PURPLE BRIGHT	H&M	69-311	\N	t	\N	2026-01-05 07:25:04.552407+00	\N
1899	19	11	5	LILAC PURPLE MEDIUM	H&M	69-310	\N	t	\N	2026-01-05 07:25:04.560646+00	\N
1900	19	11	5	LILAC PURPLE MEDIUM	H&M	69-309	\N	t	\N	2026-01-05 07:25:04.571592+00	\N
1901	19	11	4	LILAC PURPLE BRIGHT	H&M	69-308	\N	t	\N	2026-01-05 07:25:04.579514+00	\N
1902	19	11	4	LILAC PURPLE BRIGHT	H&M	69-307	\N	t	\N	2026-01-05 07:25:04.592305+00	\N
1903	19	11	4	LILAC PURPLE BRIGHT	H&M	69-306	\N	t	\N	2026-01-05 07:25:04.601253+00	\N
1904	19	11	4	LILAC PURPLE BRIGHT	H&M	69-305	\N	t	\N	2026-01-05 07:25:04.609099+00	\N
1905	19	11	2	LILAC PURPLE DARK	H&M	69-304	\N	t	\N	2026-01-05 07:25:04.617814+00	\N
1906	19	11	2	LILAC PURPLE DARK	H&M	69-303	\N	t	\N	2026-01-05 07:25:04.625195+00	\N
1907	19	11	4	LILAC PURPLE BRIGHT	H&M	69-302	\N	t	\N	2026-01-05 07:25:04.633864+00	\N
1908	19	11	2	LILAC PURPLE DARK	H&M	69-214	\N	t	\N	2026-01-05 07:25:04.641347+00	\N
1909	19	11	5	LILAC PURPLE MEDIUM	H&M	69-213	\N	t	\N	2026-01-05 07:25:04.648572+00	\N
1910	19	11	2	LILAC PURPLE DARK	H&M	69-212	\N	t	\N	2026-01-05 07:25:04.657364+00	\N
1911	19	11	2	LILAC PURPLE DARK	H&M	69-211	\N	t	\N	2026-01-05 07:25:04.664744+00	\N
1912	19	11	5	LILAC PURPLE MEDIUM	H&M	69-210	\N	t	\N	2026-01-05 07:25:04.673902+00	\N
1913	19	11	2	LILAC PURPLE DARK	H&M	69-209	\N	t	\N	2026-01-05 07:25:04.681088+00	\N
1914	19	11	5	LILAC PURPLE MEDIUM	H&M	69-208	\N	t	\N	2026-01-05 07:25:04.690556+00	\N
1915	19	11	5	LILAC PURPLE MEDIUM	H&M	69-207	\N	t	\N	2026-01-05 07:25:04.697376+00	\N
1916	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	69-206	\N	t	\N	2026-01-05 07:25:04.706909+00	\N
1917	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	69-205	\N	t	\N	2026-01-05 07:25:04.713806+00	\N
1918	19	11	2	LILAC PURPLE DARK	H&M	69-204	\N	t	\N	2026-01-05 07:25:04.723636+00	\N
1919	19	11	2	LILAC PURPLE DARK	H&M	69-203	\N	t	\N	2026-01-05 07:25:04.730727+00	\N
1920	19	11	2	LILAC PURPLE DARK	H&M	69-202	\N	t	\N	2026-01-05 07:25:04.740547+00	\N
1921	19	11	2	LILAC PURPLE DARK	H&M	69-201	\N	t	\N	2026-01-05 07:25:04.746794+00	\N
1922	19	11	2	LILAC PURPLE DARK	H&M	69-115	\N	t	\N	2026-01-05 07:25:04.756505+00	\N
1923	19	11	2	LILAC PURPLE DARK	H&M	69-114	\N	t	\N	2026-01-05 07:25:04.763295+00	\N
1924	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	69-113	\N	t	\N	2026-01-05 07:25:04.773347+00	\N
1925	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	69-112	\N	t	\N	2026-01-05 07:25:04.783757+00	\N
1926	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	69-110	\N	t	\N	2026-01-05 07:25:04.791665+00	\N
1927	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	69-109	\N	t	\N	2026-01-05 07:25:04.799972+00	\N
1928	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	69-107	\N	t	\N	2026-01-05 07:25:04.80777+00	\N
1929	19	11	2	LILAC PURPLE DARK	H&M	69-106	\N	t	\N	2026-01-05 07:25:04.815066+00	\N
1930	19	11	2	LILAC PURPLE DARK	H&M	69-105	\N	t	\N	2026-01-05 07:25:04.824334+00	\N
1931	19	11	2	LILAC PURPLE DARK	H&M	69-104	\N	t	\N	2026-01-05 07:25:04.832915+00	\N
1932	19	11	2	LILAC PURPLE DARK	H&M	69-103	\N	t	\N	2026-01-05 07:25:04.841108+00	\N
1933	19	11	2	LILAC PURPLE DARK	H&M	69-102	\N	t	\N	2026-01-05 07:25:04.849172+00	\N
1934	19	11	2	LILAC PURPLE DARK	H&M	69-101	\N	t	\N	2026-01-05 07:25:04.857861+00	\N
1935	19	11	5	LILAC PURPLE MEDIUM	H&M	68-306	\N	t	\N	2026-01-05 07:25:04.865566+00	\N
1936	19	11	5	LILAC PURPLE MEDIUM	H&M	68-305	\N	t	\N	2026-01-05 07:25:04.874116+00	\N
1937	19	11	5	LILAC PURPLE MEDIUM	H&M	68-303	\N	t	\N	2026-01-05 07:25:04.880859+00	\N
1938	19	11	5	LILAC PURPLE MEDIUM	H&M	68-302	\N	t	\N	2026-01-05 07:25:04.890335+00	\N
1939	19	11	5	LILAC PURPLE MEDIUM	H&M	68-301	\N	t	\N	2026-01-05 07:25:04.896681+00	\N
1940	19	11	5	LILAC PURPLE MEDIUM	H&M	68-208	\N	t	\N	2026-01-05 07:25:04.90663+00	\N
1941	19	11	5	LILAC PURPLE MEDIUM	H&M	68-207	\N	t	\N	2026-01-05 07:25:04.913476+00	\N
1942	19	11	5	LILAC PURPLE MEDIUM	H&M	68-206	\N	t	\N	2026-01-05 07:25:04.92369+00	\N
1943	19	11	6	LILAC PURPLE LIGHT	H&M	68-204	\N	t	\N	2026-01-05 07:25:04.930726+00	\N
1944	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	68-203	\N	t	\N	2026-01-05 07:25:04.941031+00	\N
1945	19	11	5	LILAC PURPLE MEDIUM	H&M	68-202	\N	t	\N	2026-01-05 07:25:04.950099+00	\N
1946	19	11	5	LILAC PURPLE MEDIUM	H&M	68-201	\N	t	\N	2026-01-05 07:25:04.958624+00	\N
1947	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	68-110	\N	t	\N	2026-01-05 07:25:04.967566+00	\N
1948	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	68-108	\N	t	\N	2026-01-05 07:25:04.975356+00	\N
1949	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	68-107	\N	t	\N	2026-01-05 07:25:04.985014+00	\N
1950	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	68-106	\N	t	\N	2026-01-05 07:25:04.99176+00	\N
1951	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	68-105	\N	t	\N	2026-01-05 07:25:05.00039+00	\N
1952	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	68-104	\N	t	\N	2026-01-05 07:25:05.008401+00	\N
1953	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	68-103	\N	t	\N	2026-01-05 07:25:05.017594+00	\N
1954	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	68-102	\N	t	\N	2026-01-05 07:25:05.025295+00	\N
1955	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	68-101	\N	t	\N	2026-01-05 07:25:05.034045+00	\N
1956	19	11	6	LILAC PURPLE LIGHT	H&M	67-305	\N	t	\N	2026-01-05 07:25:05.041431+00	\N
1957	19	11	6	LILAC PURPLE LIGHT	H&M	67-304	\N	t	\N	2026-01-05 07:25:05.050127+00	\N
1958	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	67-303	\N	t	\N	2026-01-05 07:25:05.057712+00	\N
1959	19	11	6	LILAC PURPLE LIGHT	H&M	67-302	\N	t	\N	2026-01-05 07:25:05.065602+00	\N
1960	19	11	6	LILAC PURPLE LIGHT	H&M	67-301	\N	t	\N	2026-01-05 07:25:05.074319+00	\N
1961	19	11	6	LILAC PURPLE LIGHT	H&M	67-204	\N	t	\N	2026-01-05 07:25:05.082224+00	\N
1962	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	67-203	\N	t	\N	2026-01-05 07:25:05.090923+00	\N
1963	19	11	6	LILAC PURPLE LIGHT	H&M	67-202	\N	t	\N	2026-01-05 07:25:05.097949+00	\N
1964	19	11	6	LILAC PURPLE LIGHT	H&M	67-201	\N	t	\N	2026-01-05 07:25:05.107171+00	\N
1965	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	67-110	\N	t	\N	2026-01-05 07:25:05.114019+00	\N
1966	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	67-109	\N	t	\N	2026-01-05 07:25:05.124191+00	\N
1967	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	67-108	\N	t	\N	2026-01-05 07:25:05.134663+00	\N
1968	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	67-107	\N	t	\N	2026-01-05 07:25:05.142733+00	\N
1969	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	67-106	\N	t	\N	2026-01-05 07:25:05.151793+00	\N
1970	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	67-105	\N	t	\N	2026-01-05 07:25:05.159393+00	\N
1971	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	67-104	\N	t	\N	2026-01-05 07:25:05.167748+00	\N
1972	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	67-103	\N	t	\N	2026-01-05 07:25:05.175406+00	\N
1973	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	67-102	\N	t	\N	2026-01-05 07:25:05.184421+00	\N
1974	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	67-101	\N	t	\N	2026-01-05 07:25:05.19235+00	\N
1975	19	11	4	LILAC PURPLE BRIGHT	H&M	66-316	\N	t	\N	2026-01-05 07:25:05.200986+00	\N
1976	19	11	4	LILAC PURPLE BRIGHT	H&M	66-315	\N	t	\N	2026-01-05 07:25:05.208404+00	\N
1977	19	11	4	LILAC PURPLE BRIGHT	H&M	66-314	\N	t	\N	2026-01-05 07:25:05.217499+00	\N
1978	19	11	2	LILAC PURPLE DARK	H&M	66-313	\N	t	\N	2026-01-05 07:25:05.225177+00	\N
1979	19	11	4	LILAC PURPLE BRIGHT	H&M	66-312	\N	t	\N	2026-01-05 07:25:05.233789+00	\N
1980	19	11	4	LILAC PURPLE BRIGHT	H&M	66-311	\N	t	\N	2026-01-05 07:25:05.241242+00	\N
1981	19	11	4	LILAC PURPLE BRIGHT	H&M	66-310	\N	t	\N	2026-01-05 07:25:05.249384+00	\N
1982	19	11	4	LILAC PURPLE BRIGHT	H&M	66-309	\N	t	\N	2026-01-05 07:25:05.257927+00	\N
1983	19	11	4	LILAC PURPLE BRIGHT	H&M	66-308	\N	t	\N	2026-01-05 07:25:05.265174+00	\N
1984	19	11	4	LILAC PURPLE BRIGHT	H&M	66-307	\N	t	\N	2026-01-05 07:25:05.274209+00	\N
1985	19	11	2	LILAC PURPLE DARK	H&M	66-306	\N	t	\N	2026-01-05 07:25:05.281573+00	\N
1986	19	11	5	LILAC PURPLE MEDIUM	H&M	66-305	\N	t	\N	2026-01-05 07:25:05.292565+00	\N
1987	19	11	5	LILAC PURPLE MEDIUM	H&M	66-304	\N	t	\N	2026-01-05 07:25:05.301599+00	\N
1988	19	11	4	LILAC PURPLE BRIGHT	H&M	66-303	\N	t	\N	2026-01-05 07:25:05.309677+00	\N
1989	19	11	2	LILAC PURPLE DARK	H&M	66-302	\N	t	\N	2026-01-05 07:25:05.31816+00	\N
1990	19	11	2	LILAC PURPLE DARK	H&M	66-301	\N	t	\N	2026-01-05 07:25:05.32566+00	\N
1991	19	11	5	LILAC PURPLE MEDIUM	H&M	66-220	\N	t	\N	2026-01-05 07:25:05.334228+00	\N
1992	19	11	2	LILAC PURPLE DARK	H&M	66-219	\N	t	\N	2026-01-05 07:25:05.342021+00	\N
1993	19	11	2	LILAC PURPLE DARK	H&M	66-218	\N	t	\N	2026-01-05 07:25:05.350155+00	\N
1994	19	11	2	LILAC PURPLE DARK	H&M	66-217	\N	t	\N	2026-01-05 07:25:05.357554+00	\N
1995	19	11	5	LILAC PURPLE MEDIUM	H&M	66-216	\N	t	\N	2026-01-05 07:25:05.364286+00	\N
1996	19	11	2	LILAC PURPLE DARK	H&M	66-215	\N	t	\N	2026-01-05 07:25:05.373934+00	\N
1997	19	11	4	LILAC PURPLE BRIGHT	H&M	66-214	\N	t	\N	2026-01-05 07:25:05.380585+00	\N
1998	19	11	2	LILAC PURPLE DARK	H&M	66-213	\N	t	\N	2026-01-05 07:25:05.390598+00	\N
1999	19	11	5	LILAC PURPLE MEDIUM	H&M	66-212	\N	t	\N	2026-01-05 07:25:05.397545+00	\N
2000	19	11	5	LILAC PURPLE MEDIUM	H&M	66-211	\N	t	\N	2026-01-05 07:25:05.406905+00	\N
2001	19	11	2	LILAC PURPLE DARK	H&M	66-210	\N	t	\N	2026-01-05 07:25:05.413325+00	\N
2002	19	11	2	LILAC PURPLE DARK	H&M	66-209	\N	t	\N	2026-01-05 07:25:05.422915+00	\N
2003	19	11	2	LILAC PURPLE DARK	H&M	66-208	\N	t	\N	2026-01-05 07:25:05.429561+00	\N
2004	19	11	2	LILAC PURPLE DARK	H&M	66-207	\N	t	\N	2026-01-05 07:25:05.439664+00	\N
2005	19	11	2	LILAC PURPLE DARK	H&M	66-206	\N	t	\N	2026-01-05 07:25:05.446348+00	\N
2006	19	11	2	LILAC PURPLE DARK	H&M	66-205	\N	t	\N	2026-01-05 07:25:05.4556+00	\N
2007	19	11	5	LILAC PURPLE MEDIUM	H&M	66-204	\N	t	\N	2026-01-05 07:25:05.461914+00	\N
2008	19	11	5	LILAC PURPLE MEDIUM	H&M	66-203	\N	t	\N	2026-01-05 07:25:05.47228+00	\N
2009	19	11	5	LILAC PURPLE MEDIUM	H&M	66-202	\N	t	\N	2026-01-05 07:25:05.479216+00	\N
2010	19	11	5	LILAC PURPLE MEDIUM	H&M	66-201	\N	t	\N	2026-01-05 07:25:05.489114+00	\N
2011	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	66-110	\N	t	\N	2026-01-05 07:25:05.496412+00	\N
2012	19	11	2	LILAC PURPLE DARK	H&M	66-109	\N	t	\N	2026-01-05 07:25:05.507236+00	\N
2013	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	66-108	\N	t	\N	2026-01-05 07:25:05.513872+00	\N
2014	19	11	2	LILAC PURPLE DARK	H&M	66-107	\N	t	\N	2026-01-05 07:25:05.523888+00	\N
2015	19	11	2	LILAC PURPLE DARK	H&M	66-106	\N	t	\N	2026-01-05 07:25:05.530612+00	\N
2016	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	66-105	\N	t	\N	2026-01-05 07:25:05.540552+00	\N
2017	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	66-104	\N	t	\N	2026-01-05 07:25:05.547397+00	\N
2018	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	66-103	\N	t	\N	2026-01-05 07:25:05.557162+00	\N
2019	19	11	2	LILAC PURPLE DARK	H&M	66-102	\N	t	\N	2026-01-05 07:25:05.564369+00	\N
2020	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	66-101	\N	t	\N	2026-01-05 07:25:05.574127+00	\N
2021	19	11	5	LILAC PURPLE MEDIUM	H&M	65-310	\N	t	\N	2026-01-05 07:25:05.580909+00	\N
2022	19	11	5	LILAC PURPLE MEDIUM	H&M	65-309	\N	t	\N	2026-01-05 07:25:05.590646+00	\N
2023	19	11	5	LILAC PURPLE MEDIUM	H&M	65-308	\N	t	\N	2026-01-05 07:25:05.598577+00	\N
2024	19	11	5	LILAC PURPLE MEDIUM	H&M	65-307	\N	t	\N	2026-01-05 07:25:05.607611+00	\N
2025	19	11	5	LILAC PURPLE MEDIUM	H&M	65-306	\N	t	\N	2026-01-05 07:25:05.614811+00	\N
2026	19	11	5	LILAC PURPLE MEDIUM	H&M	65-305	\N	t	\N	2026-01-05 07:25:05.624329+00	\N
2027	19	11	5	LILAC PURPLE MEDIUM	H&M	65-304	\N	t	\N	2026-01-05 07:25:05.632365+00	\N
2028	19	11	5	LILAC PURPLE MEDIUM	H&M	65-303	\N	t	\N	2026-01-05 07:25:05.641426+00	\N
2029	19	11	5	LILAC PURPLE MEDIUM	H&M	65-302	\N	t	\N	2026-01-05 07:25:05.650319+00	\N
2030	19	11	5	LILAC PURPLE MEDIUM	H&M	65-301	\N	t	\N	2026-01-05 07:25:05.658499+00	\N
2031	19	11	5	LILAC PURPLE MEDIUM	H&M	65-211	\N	t	\N	2026-01-05 07:25:05.667576+00	\N
2032	19	11	5	LILAC PURPLE MEDIUM	H&M	65-210	\N	t	\N	2026-01-05 07:25:05.674999+00	\N
2033	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	65-209	\N	t	\N	2026-01-05 07:25:05.683647+00	\N
2034	19	11	5	LILAC PURPLE MEDIUM	H&M	65-208	\N	t	\N	2026-01-05 07:25:05.691323+00	\N
2035	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	65-207	\N	t	\N	2026-01-05 07:25:05.698663+00	\N
2036	19	11	6	LILAC PURPLE LIGHT	H&M	65-206	\N	t	\N	2026-01-05 07:25:05.707477+00	\N
2037	19	11	5	LILAC PURPLE MEDIUM	H&M	65-205	\N	t	\N	2026-01-05 07:25:05.71487+00	\N
2038	19	11	6	LILAC PURPLE LIGHT	H&M	65-204	\N	t	\N	2026-01-05 07:25:05.724163+00	\N
2039	19	11	6	LILAC PURPLE LIGHT	H&M	65-203	\N	t	\N	2026-01-05 07:25:05.731031+00	\N
2040	19	11	5	LILAC PURPLE MEDIUM	H&M	65-202	\N	t	\N	2026-01-05 07:25:05.740585+00	\N
2041	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	65-201	\N	t	\N	2026-01-05 07:25:05.748347+00	\N
2042	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	65-105	\N	t	\N	2026-01-05 07:25:05.757706+00	\N
2043	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	65-104	\N	t	\N	2026-01-05 07:25:05.765272+00	\N
2044	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	65-103	\N	t	\N	2026-01-05 07:25:05.774085+00	\N
2045	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	65-102	\N	t	\N	2026-01-05 07:25:05.781349+00	\N
2046	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	65-101	\N	t	\N	2026-01-05 07:25:05.791009+00	\N
2047	19	11	6	LILAC PURPLE LIGHT	H&M	64-304	\N	t	\N	2026-01-05 07:25:05.79765+00	\N
2048	19	11	6	LILAC PURPLE LIGHT	H&M	64-303	\N	t	\N	2026-01-05 07:25:05.807169+00	\N
2049	19	11	6	LILAC PURPLE LIGHT	H&M	64-302	\N	t	\N	2026-01-05 07:25:05.814638+00	\N
2050	19	11	6	LILAC PURPLE LIGHT	H&M	64-301	\N	t	\N	2026-01-05 07:25:05.823636+00	\N
2051	19	11	6	LILAC PURPLE LIGHT	H&M	64-203	\N	t	\N	2026-01-05 07:25:05.833376+00	\N
2052	19	11	6	LILAC PURPLE LIGHT	H&M	64-202	\N	t	\N	2026-01-05 07:25:05.841752+00	\N
2053	19	11	6	LILAC PURPLE LIGHT	H&M	64-201	\N	t	\N	2026-01-05 07:25:05.850959+00	\N
2054	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	64-107	\N	t	\N	2026-01-05 07:25:05.85848+00	\N
2055	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	64-106	\N	t	\N	2026-01-05 07:25:05.867153+00	\N
2056	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	64-105	\N	t	\N	2026-01-05 07:25:05.874801+00	\N
2057	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	64-104	\N	t	\N	2026-01-05 07:25:05.882896+00	\N
2058	19	11	6	LILAC PURPLE LIGHT	H&M	64-103	\N	t	\N	2026-01-05 07:25:05.891081+00	\N
2059	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	64-102	\N	t	\N	2026-01-05 07:25:05.897747+00	\N
2060	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	64-101	\N	t	\N	2026-01-05 07:25:05.907195+00	\N
2061	19	11	4	LILAC PURPLE BRIGHT	H&M	63-313	\N	t	\N	2026-01-05 07:25:05.913967+00	\N
2062	19	11	4	LILAC PURPLE BRIGHT	H&M	63-312	\N	t	\N	2026-01-05 07:25:05.924395+00	\N
2063	19	11	4	LILAC PURPLE BRIGHT	H&M	63-311	\N	t	\N	2026-01-05 07:25:05.931262+00	\N
2064	19	11	4	LILAC PURPLE BRIGHT	H&M	63-310	\N	t	\N	2026-01-05 07:25:05.940621+00	\N
2065	19	11	4	LILAC PURPLE BRIGHT	H&M	63-309	\N	t	\N	2026-01-05 07:25:05.947684+00	\N
2066	19	11	2	LILAC PURPLE DARK	H&M	63-308	\N	t	\N	2026-01-05 07:25:05.957792+00	\N
2067	19	11	4	LILAC PURPLE BRIGHT	H&M	63-307	\N	t	\N	2026-01-05 07:25:05.964873+00	\N
2068	19	11	4	LILAC PURPLE BRIGHT	H&M	63-306	\N	t	\N	2026-01-05 07:25:05.973933+00	\N
2069	19	11	4	LILAC PURPLE BRIGHT	H&M	63-305	\N	t	\N	2026-01-05 07:25:05.981065+00	\N
2070	19	11	4	LILAC PURPLE BRIGHT	H&M	63-304	\N	t	\N	2026-01-05 07:25:05.990724+00	\N
2071	19	11	4	LILAC PURPLE BRIGHT	H&M	63-303	\N	t	\N	2026-01-05 07:25:05.998541+00	\N
2072	19	11	4	LILAC PURPLE BRIGHT	H&M	63-302	\N	t	\N	2026-01-05 07:25:06.008+00	\N
2073	19	11	4	LILAC PURPLE BRIGHT	H&M	63-301	\N	t	\N	2026-01-05 07:25:06.017225+00	\N
2074	19	11	2	LILAC PURPLE DARK	H&M	63-220	\N	t	\N	2026-01-05 07:25:06.025031+00	\N
2075	19	11	2	LILAC PURPLE DARK	H&M	63-219	\N	t	\N	2026-01-05 07:25:06.032938+00	\N
2076	19	11	2	LILAC PURPLE DARK	H&M	63-218	\N	t	\N	2026-01-05 07:25:06.041468+00	\N
2077	19	11	2	LILAC PURPLE DARK	H&M	63-217	\N	t	\N	2026-01-05 07:25:06.049113+00	\N
2078	19	11	2	LILAC PURPLE DARK	H&M	63-216	\N	t	\N	2026-01-05 07:25:06.057875+00	\N
2079	19	11	2	LILAC PURPLE DARK	H&M	63-215	\N	t	\N	2026-01-05 07:25:06.065303+00	\N
2080	19	11	5	LILAC PURPLE MEDIUM	H&M	63-214	\N	t	\N	2026-01-05 07:25:06.074254+00	\N
2081	19	11	2	LILAC PURPLE DARK	H&M	63-213	\N	t	\N	2026-01-05 07:25:06.081254+00	\N
2082	19	11	2	LILAC PURPLE DARK	H&M	63-212	\N	t	\N	2026-01-05 07:25:06.09076+00	\N
2083	19	11	2	LILAC PURPLE DARK	H&M	63-211	\N	t	\N	2026-01-05 07:25:06.097728+00	\N
2084	19	11	5	LILAC PURPLE MEDIUM	H&M	63-210	\N	t	\N	2026-01-05 07:25:06.106975+00	\N
2085	19	11	4	LILAC PURPLE BRIGHT	H&M	63-209	\N	t	\N	2026-01-05 07:25:06.113814+00	\N
2086	19	11	5	LILAC PURPLE MEDIUM	H&M	63-208	\N	t	\N	2026-01-05 07:25:06.123372+00	\N
2087	19	11	5	LILAC PURPLE MEDIUM	H&M	63-207	\N	t	\N	2026-01-05 07:25:06.1302+00	\N
2088	19	11	2	LILAC PURPLE DARK	H&M	63-206	\N	t	\N	2026-01-05 07:25:06.140201+00	\N
2089	19	11	4	LILAC PURPLE BRIGHT	H&M	63-205	\N	t	\N	2026-01-05 07:25:06.146943+00	\N
2090	19	11	2	LILAC PURPLE DARK	H&M	63-204	\N	t	\N	2026-01-05 07:25:06.15657+00	\N
2091	19	11	5	LILAC PURPLE MEDIUM	H&M	63-203	\N	t	\N	2026-01-05 07:25:06.163387+00	\N
2092	19	11	4	LILAC PURPLE BRIGHT	H&M	63-202	\N	t	\N	2026-01-05 07:25:06.173516+00	\N
2093	19	11	2	LILAC PURPLE DARK	H&M	63-201	\N	t	\N	2026-01-05 07:25:06.180693+00	\N
2094	19	11	2	LILAC PURPLE DARK	H&M	63-119	\N	t	\N	2026-01-05 07:25:06.191047+00	\N
2095	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	63-118	\N	t	\N	2026-01-05 07:25:06.199442+00	\N
2096	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	63-117	\N	t	\N	2026-01-05 07:25:06.207966+00	\N
2097	19	11	2	LILAC PURPLE DARK	H&M	63-115	\N	t	\N	2026-01-05 07:25:06.216003+00	\N
2098	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	63-113	\N	t	\N	2026-01-05 07:25:06.224645+00	\N
2099	19	11	2	LILAC PURPLE DARK	H&M	63-110	\N	t	\N	2026-01-05 07:25:06.232382+00	\N
2100	19	11	2	LILAC PURPLE DARK	H&M	63-109	\N	t	\N	2026-01-05 07:25:06.241047+00	\N
2101	19	11	2	LILAC PURPLE DARK	H&M	63-108	\N	t	\N	2026-01-05 07:25:06.249322+00	\N
2102	19	11	2	LILAC PURPLE DARK	H&M	63-107	\N	t	\N	2026-01-05 07:25:06.257782+00	\N
2103	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	63-106	\N	t	\N	2026-01-05 07:25:06.265863+00	\N
2104	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	63-105	\N	t	\N	2026-01-05 07:25:06.274649+00	\N
2105	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	63-104	\N	t	\N	2026-01-05 07:25:06.282482+00	\N
2106	19	11	2	LILAC PURPLE DARK	H&M	63-102	\N	t	\N	2026-01-05 07:25:06.291499+00	\N
2107	19	11	2	LILAC PURPLE DARK	H&M	63-101	\N	t	\N	2026-01-05 07:25:06.299274+00	\N
2108	19	11	4	LILAC PURPLE BRIGHT	H&M	62-301	\N	t	\N	2026-01-05 07:25:06.307946+00	\N
2109	19	11	5	LILAC PURPLE MEDIUM	H&M	62-210	\N	t	\N	2026-01-05 07:25:06.315153+00	\N
2110	19	11	5	LILAC PURPLE MEDIUM	H&M	62-209	\N	t	\N	2026-01-05 07:25:06.324369+00	\N
2111	19	11	6	LILAC PURPLE LIGHT	H&M	62-206	\N	t	\N	2026-01-05 07:25:06.331298+00	\N
2112	19	11	5	LILAC PURPLE MEDIUM	H&M	62-205	\N	t	\N	2026-01-05 07:25:06.340997+00	\N
2113	19	11	5	LILAC PURPLE MEDIUM	H&M	62-204	\N	t	\N	2026-01-05 07:25:06.349276+00	\N
2114	19	11	5	LILAC PURPLE MEDIUM	H&M	62-203	\N	t	\N	2026-01-05 07:25:06.358718+00	\N
2115	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	62-117	\N	t	\N	2026-01-05 07:25:06.367764+00	\N
2116	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	62-116	\N	t	\N	2026-01-05 07:25:06.375369+00	\N
2117	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	62-115	\N	t	\N	2026-01-05 07:25:06.383696+00	\N
2118	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	62-114	\N	t	\N	2026-01-05 07:25:06.391711+00	\N
2119	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	62-113	\N	t	\N	2026-01-05 07:25:06.398424+00	\N
2120	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	62-112	\N	t	\N	2026-01-05 07:25:06.406752+00	\N
2121	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	62-111	\N	t	\N	2026-01-05 07:25:06.412784+00	\N
2122	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	62-110	\N	t	\N	2026-01-05 07:25:06.42131+00	\N
2123	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	62-109	\N	t	\N	2026-01-05 07:25:06.428049+00	\N
2124	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	62-108	\N	t	\N	2026-01-05 07:25:06.437799+00	\N
2125	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	62-107	\N	t	\N	2026-01-05 07:25:06.444326+00	\N
2126	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	62-106	\N	t	\N	2026-01-05 07:25:06.452854+00	\N
2127	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	62-105	\N	t	\N	2026-01-05 07:25:06.459559+00	\N
2128	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	62-104	\N	t	\N	2026-01-05 07:25:06.467667+00	\N
2129	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	62-103	\N	t	\N	2026-01-05 07:25:06.474743+00	\N
2130	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	62-102	\N	t	\N	2026-01-05 07:25:06.481244+00	\N
2131	19	11	6	LILAC PURPLE LIGHT	H&M	62-101	\N	t	\N	2026-01-05 07:25:06.490191+00	\N
2132	19	11	6	LILAC PURPLE LIGHT	H&M	61-205	\N	t	\N	2026-01-05 07:25:06.496549+00	\N
2133	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	61-103	\N	t	\N	2026-01-05 07:25:06.50589+00	\N
2134	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	61-101	\N	t	\N	2026-01-05 07:25:06.512253+00	\N
2135	19	11	4	LILAC PURPLE BRIGHT	H&M	60-318	\N	t	\N	2026-01-05 07:25:06.523914+00	\N
2136	19	11	4	LILAC PURPLE BRIGHT	H&M	60-311	\N	t	\N	2026-01-05 07:25:06.534473+00	\N
2137	19	11	5	LILAC PURPLE MEDIUM	H&M	60-304	\N	t	\N	2026-01-05 07:25:06.544439+00	\N
2138	19	11	4	LILAC PURPLE BRIGHT	H&M	60-105	\N	t	\N	2026-01-05 07:25:06.555163+00	\N
2139	19	11	4	LILAC PURPLE BRIGHT	H&M	60-104	\N	t	\N	2026-01-05 07:25:06.561871+00	\N
2140	19	11	4	LILAC PURPLE BRIGHT	H&M	60-103	\N	t	\N	2026-01-05 07:25:06.572497+00	\N
2141	19	11	4	LILAC PURPLE BRIGHT	H&M	60-102	\N	t	\N	2026-01-05 07:25:06.578986+00	\N
2142	19	11	4	LILAC PURPLE BRIGHT	H&M	60-101	\N	t	\N	2026-01-05 07:25:06.588473+00	\N
2143	19	11	4	LILAC PURPLE BRIGHT	H&M	59-311	\N	t	\N	2026-01-05 07:25:06.595999+00	\N
2144	19	11	4	LILAC PURPLE BRIGHT	H&M	59-310	\N	t	\N	2026-01-05 07:25:06.607141+00	\N
2145	19	11	4	LILAC PURPLE BRIGHT	H&M	59-304	\N	t	\N	2026-01-05 07:25:06.613507+00	\N
2146	19	11	2	LILAC PURPLE DARK	H&M	59-209	\N	t	\N	2026-01-05 07:25:06.622709+00	\N
2147	19	11	5	LILAC PURPLE MEDIUM	H&M	59-206	\N	t	\N	2026-01-05 07:25:06.629097+00	\N
2148	19	11	2	LILAC PURPLE DARK	H&M	59-201	\N	t	\N	2026-01-05 07:25:06.638302+00	\N
2149	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	59-107	\N	t	\N	2026-01-05 07:25:06.645086+00	\N
2150	19	11	2	LILAC PURPLE DARK	H&M	59-103	\N	t	\N	2026-01-05 07:25:06.65357+00	\N
2151	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	59-101	\N	t	\N	2026-01-05 07:25:06.659783+00	\N
2152	19	11	1	LILAC PURPLE MEDIUM DUSTY	H&M	58-108	\N	t	\N	2026-01-05 07:25:06.667754+00	\N
2153	19	11	5	LILAC PURPLE MEDIUM	H&M	57-305	\N	t	\N	2026-01-05 07:25:06.675065+00	\N
2154	19	11	2	LILAC PURPLE DARK	H&M	53-109	\N	t	\N	2026-01-05 07:25:06.683431+00	\N
2155	19	11	2	LILAC PURPLE DARK	H&M	49-110	\N	t	\N	2026-01-05 07:25:06.692023+00	\N
2156	19	11	3	LILAC PURPLE DUSTY LIGHT	H&M	06-320	\N	t	\N	2026-01-05 07:25:06.700164+00	\N
2157	20	12	4	METAL BRIGHT	H&M	05-101	\N	t	\N	2026-01-05 07:25:06.709175+00	\N
2158	20	12	1	METAL MEDIUM DUSTY	H&M	04-101	\N	t	\N	2026-01-05 07:25:06.718513+00	\N
2159	20	12	6	METAL LIGHT	H&M	03-101	\N	t	\N	2026-01-05 07:25:06.727664+00	\N
2160	21	13	2	MOLE DARK	H&M	59-104	\N	t	\N	2026-01-05 07:25:06.738757+00	\N
2161	21	13	3	MOLE DUSTY LIGHT	H&M	52-112	\N	t	\N	2026-01-05 07:25:06.746556+00	\N
2162	21	13	3	MOLE DUSTY LIGHT	H&M	52-111	\N	t	\N	2026-01-05 07:25:06.75651+00	\N
2163	21	13	3	MOLE DUSTY LIGHT	H&M	19-315	\N	t	\N	2026-01-05 07:25:06.762825+00	\N
2164	21	13	3	MOLE DUSTY LIGHT	H&M	19-314	\N	t	\N	2026-01-05 07:25:06.772101+00	\N
2165	21	13	2	MOLE DARK	H&M	19-115	\N	t	\N	2026-01-05 07:25:06.778485+00	\N
2166	21	13	2	MOLE DARK	H&M	19-103	\N	t	\N	2026-01-05 07:25:06.786879+00	\N
2167	21	13	2	MOLE DARK	H&M	19-102	\N	t	\N	2026-01-05 07:25:06.793498+00	\N
2168	21	13	1	MOLE MEDIUM DUSTY	H&M	18-346	\N	t	\N	2026-01-05 07:25:06.801383+00	\N
2169	21	13	1	MOLE MEDIUM DUSTY	H&M	18-208	\N	t	\N	2026-01-05 07:25:06.808656+00	\N
2170	21	13	2	MOLE DARK	H&M	18-206	\N	t	\N	2026-01-05 07:25:06.81549+00	\N
2171	21	13	2	MOLE DARK	H&M	18-204	\N	t	\N	2026-01-05 07:25:06.824054+00	\N
2172	21	13	2	MOLE DARK	H&M	18-202	\N	t	\N	2026-01-05 07:25:06.830067+00	\N
2173	21	13	3	MOLE DUSTY LIGHT	H&M	16-250	\N	t	\N	2026-01-05 07:25:06.839285+00	\N
2174	21	13	1	MOLE MEDIUM DUSTY	H&M	16-251	\N	t	\N	2026-01-05 07:25:06.845835+00	\N
2175	21	13	1	MOLE MEDIUM DUSTY	H&M	16-249	\N	t	\N	2026-01-05 07:25:06.855035+00	\N
2176	21	13	1	MOLE MEDIUM DUSTY	H&M	16-248	\N	t	\N	2026-01-05 07:25:06.861423+00	\N
2177	21	13	1	MOLE MEDIUM DUSTY	H&M	16-247	\N	t	\N	2026-01-05 07:25:06.871036+00	\N
2178	21	13	1	MOLE MEDIUM DUSTY	H&M	16-246	\N	t	\N	2026-01-05 07:25:06.877618+00	\N
2179	21	13	2	MOLE DARK	H&M	16-245	\N	t	\N	2026-01-05 07:25:06.886175+00	\N
2180	21	13	3	MOLE DUSTY LIGHT	H&M	16-244	\N	t	\N	2026-01-05 07:25:06.893239+00	\N
2181	21	13	3	MOLE DUSTY LIGHT	H&M	16-243	\N	t	\N	2026-01-05 07:25:06.901421+00	\N
2182	21	13	3	MOLE DUSTY LIGHT	H&M	16-242	\N	t	\N	2026-01-05 07:25:06.90847+00	\N
2183	21	13	1	MOLE MEDIUM DUSTY	H&M	16-241	\N	t	\N	2026-01-05 07:25:06.915986+00	\N
2184	21	13	3	MOLE DUSTY LIGHT	H&M	16-240	\N	t	\N	2026-01-05 07:25:06.924279+00	\N
2185	21	13	1	MOLE MEDIUM DUSTY	H&M	16-238	\N	t	\N	2026-01-05 07:25:06.930494+00	\N
2186	21	13	3	MOLE DUSTY LIGHT	H&M	16-236	\N	t	\N	2026-01-05 07:25:06.939389+00	\N
2187	21	13	1	MOLE MEDIUM DUSTY	H&M	16-235	\N	t	\N	2026-01-05 07:25:06.945408+00	\N
2188	21	13	3	MOLE DUSTY LIGHT	H&M	16-234	\N	t	\N	2026-01-05 07:25:06.954125+00	\N
2189	21	13	1	MOLE MEDIUM DUSTY	H&M	16-233	\N	t	\N	2026-01-05 07:25:06.960487+00	\N
2190	21	13	1	MOLE MEDIUM DUSTY	H&M	16-232	\N	t	\N	2026-01-05 07:25:06.968509+00	\N
2191	21	13	1	MOLE MEDIUM DUSTY	H&M	16-231	\N	t	\N	2026-01-05 07:25:06.975482+00	\N
2192	21	13	1	MOLE MEDIUM DUSTY	H&M	16-230	\N	t	\N	2026-01-05 07:25:06.983727+00	\N
2193	21	13	1	MOLE MEDIUM DUSTY	H&M	16-229	\N	t	\N	2026-01-05 07:25:06.990836+00	\N
2194	21	13	3	MOLE DUSTY LIGHT	H&M	16-228	\N	t	\N	2026-01-05 07:25:06.997098+00	\N
2195	21	13	1	MOLE MEDIUM DUSTY	H&M	16-227	\N	t	\N	2026-01-05 07:25:07.00627+00	\N
2196	21	13	3	MOLE DUSTY LIGHT	H&M	16-226	\N	t	\N	2026-01-05 07:25:07.012459+00	\N
2197	21	13	3	MOLE DUSTY LIGHT	H&M	16-225	\N	t	\N	2026-01-05 07:25:07.021613+00	\N
2198	21	13	3	MOLE DUSTY LIGHT	H&M	16-224	\N	t	\N	2026-01-05 07:25:07.028565+00	\N
2199	21	13	3	MOLE DUSTY LIGHT	H&M	16-223	\N	t	\N	2026-01-05 07:25:07.04163+00	\N
2200	21	13	3	MOLE DUSTY LIGHT	H&M	16-222	\N	t	\N	2026-01-05 07:25:07.058794+00	\N
2201	21	13	3	MOLE DUSTY LIGHT	H&M	16-221	\N	t	\N	2026-01-05 07:25:07.071254+00	\N
2202	21	13	3	MOLE DUSTY LIGHT	H&M	16-220	\N	t	\N	2026-01-05 07:25:07.078753+00	\N
2203	21	13	1	MOLE MEDIUM DUSTY	H&M	16-219	\N	t	\N	2026-01-05 07:25:07.088157+00	\N
2204	21	13	3	MOLE DUSTY LIGHT	H&M	16-218	\N	t	\N	2026-01-05 07:25:07.094637+00	\N
2205	21	13	1	MOLE MEDIUM DUSTY	H&M	16-216	\N	t	\N	2026-01-05 07:25:07.105175+00	\N
2206	21	13	3	MOLE DUSTY LIGHT	H&M	16-215	\N	t	\N	2026-01-05 07:25:07.11354+00	\N
2207	21	13	1	MOLE MEDIUM DUSTY	H&M	16-214	\N	t	\N	2026-01-05 07:25:07.125156+00	\N
2208	21	13	1	MOLE MEDIUM DUSTY	H&M	16-213	\N	t	\N	2026-01-05 07:25:07.136075+00	\N
2209	21	13	1	MOLE MEDIUM DUSTY	H&M	16-212	\N	t	\N	2026-01-05 07:25:07.145537+00	\N
2210	21	13	1	MOLE MEDIUM DUSTY	H&M	16-211	\N	t	\N	2026-01-05 07:25:07.15769+00	\N
2211	21	13	3	MOLE DUSTY LIGHT	H&M	16-210	\N	t	\N	2026-01-05 07:25:07.168433+00	\N
2212	21	13	3	MOLE DUSTY LIGHT	H&M	16-209	\N	t	\N	2026-01-05 07:25:07.177898+00	\N
2213	21	13	3	MOLE DUSTY LIGHT	H&M	16-208	\N	t	\N	2026-01-05 07:25:07.193857+00	\N
2214	21	13	1	MOLE MEDIUM DUSTY	H&M	16-207	\N	t	\N	2026-01-05 07:25:07.206554+00	\N
2215	21	13	3	MOLE DUSTY LIGHT	H&M	16-206	\N	t	\N	2026-01-05 07:25:07.21351+00	\N
2216	21	13	1	MOLE MEDIUM DUSTY	H&M	16-205	\N	t	\N	2026-01-05 07:25:07.227555+00	\N
2217	21	13	3	MOLE DUSTY LIGHT	H&M	16-204	\N	t	\N	2026-01-05 07:25:07.238921+00	\N
2218	21	13	1	MOLE MEDIUM DUSTY	H&M	16-203	\N	t	\N	2026-01-05 07:25:07.247475+00	\N
2219	21	13	3	MOLE DUSTY LIGHT	H&M	16-202	\N	t	\N	2026-01-05 07:25:07.257895+00	\N
2220	21	13	3	MOLE DUSTY LIGHT	H&M	16-201	\N	t	\N	2026-01-05 07:25:07.263774+00	\N
2221	21	13	1	MOLE MEDIUM DUSTY	H&M	16-115	\N	t	\N	2026-01-05 07:25:07.272527+00	\N
2222	21	13	3	MOLE DUSTY LIGHT	H&M	16-114	\N	t	\N	2026-01-05 07:25:07.278471+00	\N
2223	21	13	3	MOLE DUSTY LIGHT	H&M	16-113	\N	t	\N	2026-01-05 07:25:07.286616+00	\N
2224	21	13	3	MOLE DUSTY LIGHT	H&M	16-111	\N	t	\N	2026-01-05 07:25:07.292674+00	\N
2225	21	13	1	MOLE MEDIUM DUSTY	H&M	16-109	\N	t	\N	2026-01-05 07:25:07.300737+00	\N
2226	21	13	1	MOLE MEDIUM DUSTY	H&M	16-108	\N	t	\N	2026-01-05 07:25:07.307512+00	\N
2227	21	13	1	MOLE MEDIUM DUSTY	H&M	16-107	\N	t	\N	2026-01-05 07:25:07.313306+00	\N
2228	21	13	1	MOLE MEDIUM DUSTY	H&M	16-106	\N	t	\N	2026-01-05 07:25:07.322659+00	\N
2229	21	13	2	MOLE DARK	H&M	16-104	\N	t	\N	2026-01-05 07:25:07.328823+00	\N
2230	21	13	1	MOLE MEDIUM DUSTY	H&M	16-103	\N	t	\N	2026-01-05 07:25:07.338845+00	\N
2231	21	13	1	MOLE MEDIUM DUSTY	H&M	16-101	\N	t	\N	2026-01-05 07:25:07.345329+00	\N
2232	21	13	2	MOLE DARK	H&M	15-235	\N	t	\N	2026-01-05 07:25:07.355157+00	\N
2233	21	13	1	MOLE MEDIUM DUSTY	H&M	15-234	\N	t	\N	2026-01-05 07:25:07.36196+00	\N
2234	21	13	1	MOLE MEDIUM DUSTY	H&M	15-233	\N	t	\N	2026-01-05 07:25:07.371285+00	\N
2235	21	13	1	MOLE MEDIUM DUSTY	H&M	15-232	\N	t	\N	2026-01-05 07:25:07.378383+00	\N
2236	21	13	2	MOLE DARK	H&M	15-230	\N	t	\N	2026-01-05 07:25:07.387815+00	\N
2237	21	13	1	MOLE MEDIUM DUSTY	H&M	15-229	\N	t	\N	2026-01-05 07:25:07.394915+00	\N
2238	21	13	1	MOLE MEDIUM DUSTY	H&M	15-228	\N	t	\N	2026-01-05 07:25:07.405437+00	\N
2239	21	13	2	MOLE DARK	H&M	15-227	\N	t	\N	2026-01-05 07:25:07.414499+00	\N
2240	21	13	2	MOLE DARK	H&M	15-226	\N	t	\N	2026-01-05 07:25:07.425945+00	\N
2241	21	13	2	MOLE DARK	H&M	15-225	\N	t	\N	2026-01-05 07:25:07.435056+00	\N
2242	21	13	2	MOLE DARK	H&M	15-224	\N	t	\N	2026-01-05 07:25:07.443744+00	\N
2243	21	13	1	MOLE MEDIUM DUSTY	H&M	15-223	\N	t	\N	2026-01-05 07:25:07.454071+00	\N
2244	21	13	2	MOLE DARK	H&M	15-222	\N	t	\N	2026-01-05 07:25:07.461255+00	\N
2245	21	13	2	MOLE DARK	H&M	15-221	\N	t	\N	2026-01-05 07:25:07.470481+00	\N
2246	21	13	2	MOLE DARK	H&M	15-220	\N	t	\N	2026-01-05 07:25:07.477191+00	\N
2247	21	13	2	MOLE DARK	H&M	15-218	\N	t	\N	2026-01-05 07:25:07.485336+00	\N
2248	21	13	2	MOLE DARK	H&M	15-217	\N	t	\N	2026-01-05 07:25:07.492355+00	\N
2249	21	13	1	MOLE MEDIUM DUSTY	H&M	15-216	\N	t	\N	2026-01-05 07:25:07.50028+00	\N
2250	21	13	2	MOLE DARK	H&M	15-215	\N	t	\N	2026-01-05 07:25:07.507264+00	\N
2251	21	13	1	MOLE MEDIUM DUSTY	H&M	15-214	\N	t	\N	2026-01-05 07:25:07.513654+00	\N
2252	21	13	2	MOLE DARK	H&M	15-212	\N	t	\N	2026-01-05 07:25:07.525101+00	\N
2253	21	13	2	MOLE DARK	H&M	15-209	\N	t	\N	2026-01-05 07:25:07.54321+00	\N
2254	21	13	2	MOLE DARK	H&M	15-208	\N	t	\N	2026-01-05 07:25:07.559725+00	\N
2255	21	13	2	MOLE DARK	H&M	15-207	\N	t	\N	2026-01-05 07:25:07.572916+00	\N
2256	21	13	2	MOLE DARK	H&M	15-205	\N	t	\N	2026-01-05 07:25:07.581028+00	\N
2257	21	13	2	MOLE DARK	H&M	15-204	\N	t	\N	2026-01-05 07:25:07.593926+00	\N
2258	21	13	2	MOLE DARK	H&M	15-203	\N	t	\N	2026-01-05 07:25:07.605527+00	\N
2259	21	13	1	MOLE MEDIUM DUSTY	H&M	15-201	\N	t	\N	2026-01-05 07:25:07.621328+00	\N
2260	21	13	2	MOLE DARK	H&M	15-112	\N	t	\N	2026-01-05 07:25:07.642532+00	\N
2261	21	13	2	MOLE DARK	H&M	15-111	\N	t	\N	2026-01-05 07:25:07.651178+00	\N
2262	21	13	2	MOLE DARK	H&M	15-110	\N	t	\N	2026-01-05 07:25:07.657758+00	\N
2263	21	13	2	MOLE DARK	H&M	15-109	\N	t	\N	2026-01-05 07:25:07.66339+00	\N
2264	21	13	2	MOLE DARK	H&M	15-108	\N	t	\N	2026-01-05 07:25:07.671877+00	\N
2265	21	13	2	MOLE DARK	H&M	15-107	\N	t	\N	2026-01-05 07:25:07.677527+00	\N
2266	21	13	2	MOLE DARK	H&M	15-104	\N	t	\N	2026-01-05 07:25:07.685018+00	\N
2267	21	13	2	MOLE DARK	H&M	15-103	\N	t	\N	2026-01-05 07:25:07.691251+00	\N
2268	21	13	1	MOLE MEDIUM DUSTY	H&M	15-102	\N	t	\N	2026-01-05 07:25:07.696948+00	\N
2269	21	13	2	MOLE DARK	H&M	15-101	\N	t	\N	2026-01-05 07:25:07.705418+00	\N
2270	21	13	1	MOLE MEDIUM DUSTY	H&M	14-307	\N	t	\N	2026-01-05 07:25:07.711203+00	\N
2271	21	13	1	MOLE MEDIUM DUSTY	H&M	14-209	\N	t	\N	2026-01-05 07:25:07.719659+00	\N
2272	21	13	1	MOLE MEDIUM DUSTY	H&M	14-208	\N	t	\N	2026-01-05 07:25:07.726634+00	\N
2273	21	13	2	MOLE DARK	H&M	14-207	\N	t	\N	2026-01-05 07:25:07.735319+00	\N
2274	21	13	1	MOLE MEDIUM DUSTY	H&M	13-240	\N	t	\N	2026-01-05 07:25:07.742076+00	\N
2275	21	13	3	MOLE DUSTY LIGHT	H&M	13-229	\N	t	\N	2026-01-05 07:25:07.749632+00	\N
2276	21	13	3	MOLE DUSTY LIGHT	H&M	13-224	\N	t	\N	2026-01-05 07:25:07.761871+00	\N
2277	21	13	1	MOLE MEDIUM DUSTY	H&M	13-201	\N	t	\N	2026-01-05 07:25:07.778266+00	\N
2278	21	13	3	MOLE DUSTY LIGHT	H&M	12-343	\N	t	\N	2026-01-05 07:25:07.792804+00	\N
2279	21	13	3	MOLE DUSTY LIGHT	H&M	12-235	\N	t	\N	2026-01-05 07:25:07.80549+00	\N
2280	21	13	3	MOLE DUSTY LIGHT	H&M	12-231	\N	t	\N	2026-01-05 07:25:07.812654+00	\N
2281	21	13	3	MOLE DUSTY LIGHT	H&M	12-229	\N	t	\N	2026-01-05 07:25:07.823123+00	\N
2282	21	13	3	MOLE DUSTY LIGHT	H&M	12-227	\N	t	\N	2026-01-05 07:25:07.830529+00	\N
2283	21	13	3	MOLE DUSTY LIGHT	H&M	12-214	\N	t	\N	2026-01-05 07:25:07.844663+00	\N
2284	21	13	3	MOLE DUSTY LIGHT	H&M	12-213	\N	t	\N	2026-01-05 07:25:07.857685+00	\N
2285	21	13	3	MOLE DUSTY LIGHT	H&M	12-210	\N	t	\N	2026-01-05 07:25:07.86975+00	\N
2286	21	13	3	MOLE DUSTY LIGHT	H&M	12-208	\N	t	\N	2026-01-05 07:25:07.878662+00	\N
2287	21	13	3	MOLE DUSTY LIGHT	H&M	12-205	\N	t	\N	2026-01-05 07:25:07.892022+00	\N
2288	21	13	3	MOLE DUSTY LIGHT	H&M	12-201	\N	t	\N	2026-01-05 07:25:07.903301+00	\N
2289	21	13	1	MOLE MEDIUM DUSTY	H&M	08-238	\N	t	\N	2026-01-05 07:25:07.9121+00	\N
2290	21	13	2	MOLE DARK	H&M	08-235	\N	t	\N	2026-01-05 07:25:07.926228+00	\N
2291	21	13	1	MOLE MEDIUM DUSTY	H&M	07-219	\N	t	\N	2026-01-05 07:25:07.940499+00	\N
2292	21	13	3	MOLE DUSTY LIGHT	H&M	06-317	\N	t	\N	2026-01-05 07:25:07.952548+00	\N
2293	22	14	2	ORANGE DARK	H&M	43-304	\N	t	\N	2026-01-05 07:25:07.96337+00	\N
2294	22	14	2	ORANGE DARK	H&M	43-303	\N	t	\N	2026-01-05 07:25:07.9779+00	\N
2295	22	14	2	ORANGE DARK	H&M	43-302	\N	t	\N	2026-01-05 07:25:07.988415+00	\N
2296	22	14	2	ORANGE DARK	H&M	43-301	\N	t	\N	2026-01-05 07:25:07.995165+00	\N
2297	22	14	2	ORANGE DARK	H&M	43-211	\N	t	\N	2026-01-05 07:25:08.005091+00	\N
2298	22	14	2	ORANGE DARK	H&M	43-210	\N	t	\N	2026-01-05 07:25:08.011989+00	\N
2299	22	14	2	ORANGE DARK	H&M	39-317	\N	t	\N	2026-01-05 07:25:08.022165+00	\N
2300	22	14	2	ORANGE DARK	H&M	39-316	\N	t	\N	2026-01-05 07:25:08.03008+00	\N
2301	22	14	4	ORANGE BRIGHT	H&M	39-313	\N	t	\N	2026-01-05 07:25:08.039352+00	\N
2302	22	14	4	ORANGE BRIGHT	H&M	39-312	\N	t	\N	2026-01-05 07:25:08.046299+00	\N
2303	22	14	4	ORANGE BRIGHT	H&M	39-311	\N	t	\N	2026-01-05 07:25:08.055244+00	\N
2304	22	14	5	ORANGE MEDIUM	H&M	39-310	\N	t	\N	2026-01-05 07:25:08.061515+00	\N
2305	22	14	4	ORANGE BRIGHT	H&M	39-308	\N	t	\N	2026-01-05 07:25:08.070335+00	\N
2306	22	14	5	ORANGE MEDIUM	H&M	39-307	\N	t	\N	2026-01-05 07:25:08.077241+00	\N
2307	22	14	4	ORANGE BRIGHT	H&M	39-305	\N	t	\N	2026-01-05 07:25:08.085417+00	\N
2308	22	14	4	ORANGE BRIGHT	H&M	39-304	\N	t	\N	2026-01-05 07:25:08.092489+00	\N
2309	22	14	5	ORANGE MEDIUM	H&M	39-303	\N	t	\N	2026-01-05 07:25:08.100774+00	\N
2310	22	14	5	ORANGE MEDIUM	H&M	39-302	\N	t	\N	2026-01-05 07:25:08.109002+00	\N
2311	22	14	4	ORANGE BRIGHT	H&M	39-301	\N	t	\N	2026-01-05 07:25:08.117411+00	\N
2312	22	14	2	ORANGE DARK	H&M	39-219	\N	t	\N	2026-01-05 07:25:08.124486+00	\N
2313	22	14	2	ORANGE DARK	H&M	39-218	\N	t	\N	2026-01-05 07:25:08.132543+00	\N
2314	22	14	2	ORANGE DARK	H&M	39-217	\N	t	\N	2026-01-05 07:25:08.141383+00	\N
2315	22	14	5	ORANGE MEDIUM	H&M	39-216	\N	t	\N	2026-01-05 07:25:08.148806+00	\N
2316	22	14	2	ORANGE DARK	H&M	39-214	\N	t	\N	2026-01-05 07:25:08.15741+00	\N
2317	22	14	2	ORANGE DARK	H&M	39-212	\N	t	\N	2026-01-05 07:25:08.164465+00	\N
2318	22	14	1	ORANGE MEDIUM DUSTY	H&M	39-211	\N	t	\N	2026-01-05 07:25:08.173799+00	\N
2319	22	14	1	ORANGE MEDIUM DUSTY	H&M	39-210	\N	t	\N	2026-01-05 07:25:08.180816+00	\N
2320	22	14	2	ORANGE DARK	H&M	39-209	\N	t	\N	2026-01-05 07:25:08.190967+00	\N
2321	22	14	2	ORANGE DARK	H&M	39-208	\N	t	\N	2026-01-05 07:25:08.198392+00	\N
2322	22	14	2	ORANGE DARK	H&M	39-206	\N	t	\N	2026-01-05 07:25:08.20774+00	\N
2323	22	14	1	ORANGE MEDIUM DUSTY	H&M	39-205	\N	t	\N	2026-01-05 07:25:08.214868+00	\N
2324	22	14	1	ORANGE MEDIUM DUSTY	H&M	39-204	\N	t	\N	2026-01-05 07:25:08.224228+00	\N
2325	22	14	1	ORANGE MEDIUM DUSTY	H&M	39-201	\N	t	\N	2026-01-05 07:25:08.233617+00	\N
2326	22	14	4	ORANGE BRIGHT	H&M	38-332	\N	t	\N	2026-01-05 07:25:08.243483+00	\N
2327	22	14	5	ORANGE MEDIUM	H&M	38-331	\N	t	\N	2026-01-05 07:25:08.253363+00	\N
2328	22	14	4	ORANGE BRIGHT	H&M	38-330	\N	t	\N	2026-01-05 07:25:08.259379+00	\N
2329	22	14	4	ORANGE BRIGHT	H&M	38-329	\N	t	\N	2026-01-05 07:25:08.267831+00	\N
2330	22	14	5	ORANGE MEDIUM	H&M	38-328	\N	t	\N	2026-01-05 07:25:08.275808+00	\N
2331	22	14	4	ORANGE BRIGHT	H&M	38-327	\N	t	\N	2026-01-05 07:25:08.284149+00	\N
2332	22	14	4	ORANGE BRIGHT	H&M	38-326	\N	t	\N	2026-01-05 07:25:08.29239+00	\N
2333	22	14	5	ORANGE MEDIUM	H&M	38-325	\N	t	\N	2026-01-05 07:25:08.301729+00	\N
2334	22	14	5	ORANGE MEDIUM	H&M	38-324	\N	t	\N	2026-01-05 07:25:08.309334+00	\N
2335	22	14	5	ORANGE MEDIUM	H&M	38-323	\N	t	\N	2026-01-05 07:25:08.317358+00	\N
2336	22	14	4	ORANGE BRIGHT	H&M	38-322	\N	t	\N	2026-01-05 07:25:08.325611+00	\N
2337	22	14	4	ORANGE BRIGHT	H&M	38-321	\N	t	\N	2026-01-05 07:25:08.334329+00	\N
2338	22	14	4	ORANGE BRIGHT	H&M	38-320	\N	t	\N	2026-01-05 07:25:08.342518+00	\N
2339	22	14	4	ORANGE BRIGHT	H&M	38-319	\N	t	\N	2026-01-05 07:25:08.351108+00	\N
2340	22	14	4	ORANGE BRIGHT	H&M	38-318	\N	t	\N	2026-01-05 07:25:08.35879+00	\N
2341	22	14	4	ORANGE BRIGHT	H&M	38-317	\N	t	\N	2026-01-05 07:25:08.367181+00	\N
2342	22	14	5	ORANGE MEDIUM	H&M	38-316	\N	t	\N	2026-01-05 07:25:08.374937+00	\N
2343	22	14	5	ORANGE MEDIUM	H&M	38-315	\N	t	\N	2026-01-05 07:25:08.383479+00	\N
2344	22	14	4	ORANGE BRIGHT	H&M	38-314	\N	t	\N	2026-01-05 07:25:08.391723+00	\N
2345	22	14	4	ORANGE BRIGHT	H&M	38-313	\N	t	\N	2026-01-05 07:25:08.400435+00	\N
2346	22	14	5	ORANGE MEDIUM	H&M	38-312	\N	t	\N	2026-01-05 07:25:08.408385+00	\N
2347	22	14	5	ORANGE MEDIUM	H&M	38-311	\N	t	\N	2026-01-05 07:25:08.417594+00	\N
2348	22	14	5	ORANGE MEDIUM	H&M	38-310	\N	t	\N	2026-01-05 07:25:08.425295+00	\N
2349	22	14	5	ORANGE MEDIUM	H&M	38-309	\N	t	\N	2026-01-05 07:25:08.433729+00	\N
2350	22	14	4	ORANGE BRIGHT	H&M	38-308	\N	t	\N	2026-01-05 07:25:08.441561+00	\N
2351	22	14	4	ORANGE BRIGHT	H&M	38-307	\N	t	\N	2026-01-05 07:25:08.451095+00	\N
2352	22	14	4	ORANGE BRIGHT	H&M	38-306	\N	t	\N	2026-01-05 07:25:08.459487+00	\N
2353	22	14	5	ORANGE MEDIUM	H&M	38-305	\N	t	\N	2026-01-05 07:25:08.46771+00	\N
2354	22	14	4	ORANGE BRIGHT	H&M	38-304	\N	t	\N	2026-01-05 07:25:08.476165+00	\N
2355	22	14	5	ORANGE MEDIUM	H&M	38-303	\N	t	\N	2026-01-05 07:25:08.484736+00	\N
2356	22	14	4	ORANGE BRIGHT	H&M	38-302	\N	t	\N	2026-01-05 07:25:08.492547+00	\N
2357	22	14	5	ORANGE MEDIUM	H&M	38-221	\N	t	\N	2026-01-05 07:25:08.500965+00	\N
2358	22	14	1	ORANGE MEDIUM DUSTY	H&M	38-220	\N	t	\N	2026-01-05 07:25:08.508471+00	\N
2359	22	14	5	ORANGE MEDIUM	H&M	38-219	\N	t	\N	2026-01-05 07:25:08.516818+00	\N
2360	22	14	6	ORANGE LIGHT	H&M	38-215	\N	t	\N	2026-01-05 07:25:08.52456+00	\N
2361	22	14	6	ORANGE LIGHT	H&M	38-214	\N	t	\N	2026-01-05 07:25:08.531967+00	\N
2362	22	14	1	ORANGE MEDIUM DUSTY	H&M	38-213	\N	t	\N	2026-01-05 07:25:08.541041+00	\N
2363	22	14	3	ORANGE DUSTY LIGHT	H&M	38-212	\N	t	\N	2026-01-05 07:25:08.547967+00	\N
2364	22	14	6	ORANGE LIGHT	H&M	38-211	\N	t	\N	2026-01-05 07:25:08.558816+00	\N
2365	22	14	5	ORANGE MEDIUM	H&M	38-209	\N	t	\N	2026-01-05 07:25:08.567419+00	\N
2366	22	14	1	ORANGE MEDIUM DUSTY	H&M	38-204	\N	t	\N	2026-01-05 07:25:08.575151+00	\N
2367	22	14	1	ORANGE MEDIUM DUSTY	H&M	38-203	\N	t	\N	2026-01-05 07:25:08.583624+00	\N
2368	22	14	1	ORANGE MEDIUM DUSTY	H&M	38-202	\N	t	\N	2026-01-05 07:25:08.591633+00	\N
2369	22	14	5	ORANGE MEDIUM	H&M	38-201	\N	t	\N	2026-01-05 07:25:08.600087+00	\N
2370	22	14	1	ORANGE MEDIUM DUSTY	H&M	38-110	\N	t	\N	2026-01-05 07:25:08.608009+00	\N
2371	22	14	1	ORANGE MEDIUM DUSTY	H&M	38-109	\N	t	\N	2026-01-05 07:25:08.617819+00	\N
2372	22	14	1	ORANGE MEDIUM DUSTY	H&M	38-108	\N	t	\N	2026-01-05 07:25:08.626943+00	\N
2373	22	14	3	ORANGE DUSTY LIGHT	H&M	38-105	\N	t	\N	2026-01-05 07:25:08.639644+00	\N
2374	22	14	3	ORANGE DUSTY LIGHT	H&M	38-104	\N	t	\N	2026-01-05 07:25:08.648024+00	\N
2375	22	14	3	ORANGE DUSTY LIGHT	H&M	38-101	\N	t	\N	2026-01-05 07:25:08.658586+00	\N
2376	22	14	5	ORANGE MEDIUM	H&M	37-310	\N	t	\N	2026-01-05 07:25:08.66809+00	\N
2377	22	14	6	ORANGE LIGHT	H&M	37-309	\N	t	\N	2026-01-05 07:25:08.675589+00	\N
2378	22	14	6	ORANGE LIGHT	H&M	37-308	\N	t	\N	2026-01-05 07:25:08.684578+00	\N
2379	22	14	3	ORANGE DUSTY LIGHT	H&M	37-307	\N	t	\N	2026-01-05 07:25:08.693575+00	\N
2380	22	14	4	ORANGE BRIGHT	H&M	37-306	\N	t	\N	2026-01-05 07:25:08.702613+00	\N
2381	22	14	6	ORANGE LIGHT	H&M	37-305	\N	t	\N	2026-01-05 07:25:08.709465+00	\N
2382	22	14	6	ORANGE LIGHT	H&M	37-304	\N	t	\N	2026-01-05 07:25:08.717647+00	\N
2383	22	14	6	ORANGE LIGHT	H&M	37-303	\N	t	\N	2026-01-05 07:25:08.725443+00	\N
2384	22	14	3	ORANGE DUSTY LIGHT	H&M	37-216	\N	t	\N	2026-01-05 07:25:08.734021+00	\N
2385	22	14	6	ORANGE LIGHT	H&M	37-215	\N	t	\N	2026-01-05 07:25:08.741782+00	\N
2386	22	14	3	ORANGE DUSTY LIGHT	H&M	37-214	\N	t	\N	2026-01-05 07:25:08.750561+00	\N
2387	22	14	3	ORANGE DUSTY LIGHT	H&M	37-213	\N	t	\N	2026-01-05 07:25:08.758266+00	\N
2388	22	14	6	ORANGE LIGHT	H&M	37-212	\N	t	\N	2026-01-05 07:25:08.766787+00	\N
2389	22	14	3	ORANGE DUSTY LIGHT	H&M	37-211	\N	t	\N	2026-01-05 07:25:08.774737+00	\N
2390	22	14	6	ORANGE LIGHT	H&M	37-210	\N	t	\N	2026-01-05 07:25:08.78359+00	\N
2391	22	14	6	ORANGE LIGHT	H&M	37-209	\N	t	\N	2026-01-05 07:25:08.791299+00	\N
2392	22	14	6	ORANGE LIGHT	H&M	37-208	\N	t	\N	2026-01-05 07:25:08.800353+00	\N
2393	22	14	6	ORANGE LIGHT	H&M	37-207	\N	t	\N	2026-01-05 07:25:08.809449+00	\N
2394	22	14	6	ORANGE LIGHT	H&M	37-206	\N	t	\N	2026-01-05 07:25:08.818109+00	\N
2395	22	14	6	ORANGE LIGHT	H&M	37-205	\N	t	\N	2026-01-05 07:25:08.825422+00	\N
2396	22	14	6	ORANGE LIGHT	H&M	37-204	\N	t	\N	2026-01-05 07:25:08.833835+00	\N
2397	22	14	6	ORANGE LIGHT	H&M	37-203	\N	t	\N	2026-01-05 07:25:08.841754+00	\N
2398	22	14	3	ORANGE DUSTY LIGHT	H&M	37-202	\N	t	\N	2026-01-05 07:25:08.850057+00	\N
2399	22	14	6	ORANGE LIGHT	H&M	37-201	\N	t	\N	2026-01-05 07:25:08.857818+00	\N
2400	22	14	3	ORANGE DUSTY LIGHT	H&M	37-124	\N	t	\N	2026-01-05 07:25:08.865619+00	\N
2401	22	14	3	ORANGE DUSTY LIGHT	H&M	37-123	\N	t	\N	2026-01-05 07:25:08.874458+00	\N
2402	22	14	3	ORANGE DUSTY LIGHT	H&M	37-122	\N	t	\N	2026-01-05 07:25:08.881817+00	\N
2403	22	14	3	ORANGE DUSTY LIGHT	H&M	37-121	\N	t	\N	2026-01-05 07:25:08.890851+00	\N
2404	22	14	3	ORANGE DUSTY LIGHT	H&M	37-120	\N	t	\N	2026-01-05 07:25:08.898094+00	\N
2405	22	14	3	ORANGE DUSTY LIGHT	H&M	37-119	\N	t	\N	2026-01-05 07:25:08.9076+00	\N
2406	22	14	3	ORANGE DUSTY LIGHT	H&M	37-118	\N	t	\N	2026-01-05 07:25:08.914402+00	\N
2407	22	14	3	ORANGE DUSTY LIGHT	H&M	37-117	\N	t	\N	2026-01-05 07:25:08.924018+00	\N
2408	22	14	3	ORANGE DUSTY LIGHT	H&M	37-116	\N	t	\N	2026-01-05 07:25:08.931503+00	\N
2409	22	14	3	ORANGE DUSTY LIGHT	H&M	37-115	\N	t	\N	2026-01-05 07:25:08.940769+00	\N
2410	22	14	3	ORANGE DUSTY LIGHT	H&M	37-114	\N	t	\N	2026-01-05 07:25:08.947975+00	\N
2411	22	14	3	ORANGE DUSTY LIGHT	H&M	37-113	\N	t	\N	2026-01-05 07:25:08.957448+00	\N
2412	22	14	3	ORANGE DUSTY LIGHT	H&M	37-112	\N	t	\N	2026-01-05 07:25:08.964477+00	\N
2413	22	14	3	ORANGE DUSTY LIGHT	H&M	37-111	\N	t	\N	2026-01-05 07:25:08.973657+00	\N
2414	22	14	3	ORANGE DUSTY LIGHT	H&M	37-110	\N	t	\N	2026-01-05 07:25:08.980852+00	\N
2415	22	14	3	ORANGE DUSTY LIGHT	H&M	37-109	\N	t	\N	2026-01-05 07:25:08.991112+00	\N
2416	22	14	3	ORANGE DUSTY LIGHT	H&M	37-108	\N	t	\N	2026-01-05 07:25:08.999906+00	\N
2417	22	14	3	ORANGE DUSTY LIGHT	H&M	37-106	\N	t	\N	2026-01-05 07:25:09.007867+00	\N
2418	22	14	3	ORANGE DUSTY LIGHT	H&M	37-105	\N	t	\N	2026-01-05 07:25:09.015542+00	\N
2419	22	14	3	ORANGE DUSTY LIGHT	H&M	37-104	\N	t	\N	2026-01-05 07:25:09.024327+00	\N
2420	22	14	3	ORANGE DUSTY LIGHT	H&M	37-103	\N	t	\N	2026-01-05 07:25:09.031745+00	\N
2421	22	14	3	ORANGE DUSTY LIGHT	H&M	37-102	\N	t	\N	2026-01-05 07:25:09.040841+00	\N
2422	22	14	3	ORANGE DUSTY LIGHT	H&M	37-101	\N	t	\N	2026-01-05 07:25:09.048001+00	\N
2423	22	14	2	ORANGE DARK	H&M	36-311	\N	t	\N	2026-01-05 07:25:09.057293+00	\N
2424	22	14	2	ORANGE DARK	H&M	36-310	\N	t	\N	2026-01-05 07:25:09.06445+00	\N
2425	22	14	2	ORANGE DARK	H&M	36-309	\N	t	\N	2026-01-05 07:25:09.073566+00	\N
2426	22	14	2	ORANGE DARK	H&M	36-308	\N	t	\N	2026-01-05 07:25:09.080516+00	\N
2427	22	14	2	ORANGE DARK	H&M	36-307	\N	t	\N	2026-01-05 07:25:09.090237+00	\N
2428	22	14	2	ORANGE DARK	H&M	36-306	\N	t	\N	2026-01-05 07:25:09.097+00	\N
2429	22	14	2	ORANGE DARK	H&M	36-305	\N	t	\N	2026-01-05 07:25:09.106814+00	\N
2430	22	14	2	ORANGE DARK	H&M	36-304	\N	t	\N	2026-01-05 07:25:09.113757+00	\N
2431	22	14	5	ORANGE MEDIUM	H&M	36-303	\N	t	\N	2026-01-05 07:25:09.123032+00	\N
2432	22	14	2	ORANGE DARK	H&M	36-302	\N	t	\N	2026-01-05 07:25:09.129755+00	\N
2433	22	14	2	ORANGE DARK	H&M	36-301	\N	t	\N	2026-01-05 07:25:09.142314+00	\N
2434	22	14	2	ORANGE DARK	H&M	36-216	\N	t	\N	2026-01-05 07:25:09.150838+00	\N
2435	22	14	2	ORANGE DARK	H&M	36-215	\N	t	\N	2026-01-05 07:25:09.159019+00	\N
2436	22	14	2	ORANGE DARK	H&M	36-214	\N	t	\N	2026-01-05 07:25:09.171299+00	\N
2437	22	14	1	ORANGE MEDIUM DUSTY	H&M	36-211	\N	t	\N	2026-01-05 07:25:09.179522+00	\N
2438	22	14	2	ORANGE DARK	H&M	36-208	\N	t	\N	2026-01-05 07:25:09.192815+00	\N
2439	22	14	2	ORANGE DARK	H&M	36-207	\N	t	\N	2026-01-05 07:25:09.202717+00	\N
2440	22	14	2	ORANGE DARK	H&M	36-205	\N	t	\N	2026-01-05 07:25:09.209355+00	\N
2441	22	14	2	ORANGE DARK	H&M	36-204	\N	t	\N	2026-01-05 07:25:09.217543+00	\N
2442	22	14	4	ORANGE BRIGHT	H&M	35-334	\N	t	\N	2026-01-05 07:25:09.224883+00	\N
2443	22	14	4	ORANGE BRIGHT	H&M	35-333	\N	t	\N	2026-01-05 07:25:09.233503+00	\N
2444	22	14	4	ORANGE BRIGHT	H&M	35-332	\N	t	\N	2026-01-05 07:25:09.241663+00	\N
2445	22	14	4	ORANGE BRIGHT	H&M	35-331	\N	t	\N	2026-01-05 07:25:09.251142+00	\N
2446	22	14	5	ORANGE MEDIUM	H&M	35-330	\N	t	\N	2026-01-05 07:25:09.26196+00	\N
2447	22	14	4	ORANGE BRIGHT	H&M	35-329	\N	t	\N	2026-01-05 07:25:09.277509+00	\N
2448	22	14	4	ORANGE BRIGHT	H&M	35-328	\N	t	\N	2026-01-05 07:25:09.288963+00	\N
2449	22	14	4	ORANGE BRIGHT	H&M	35-327	\N	t	\N	2026-01-05 07:25:09.295929+00	\N
2450	22	14	4	ORANGE BRIGHT	H&M	35-326	\N	t	\N	2026-01-05 07:25:09.305694+00	\N
2451	22	14	4	ORANGE BRIGHT	H&M	35-325	\N	t	\N	2026-01-05 07:25:09.313528+00	\N
2452	22	14	4	ORANGE BRIGHT	H&M	35-324	\N	t	\N	2026-01-05 07:25:09.331573+00	\N
2453	22	14	5	ORANGE MEDIUM	H&M	35-323	\N	t	\N	2026-01-05 07:25:09.342706+00	\N
2454	22	14	5	ORANGE MEDIUM	H&M	35-322	\N	t	\N	2026-01-05 07:25:09.350721+00	\N
2455	22	14	4	ORANGE BRIGHT	H&M	35-321	\N	t	\N	2026-01-05 07:25:09.357508+00	\N
2456	22	14	4	ORANGE BRIGHT	H&M	35-320	\N	t	\N	2026-01-05 07:25:09.363681+00	\N
2457	22	14	5	ORANGE MEDIUM	H&M	35-319	\N	t	\N	2026-01-05 07:25:09.373923+00	\N
2458	22	14	5	ORANGE MEDIUM	H&M	35-318	\N	t	\N	2026-01-05 07:25:09.380218+00	\N
2459	22	14	4	ORANGE BRIGHT	H&M	35-317	\N	t	\N	2026-01-05 07:25:09.391472+00	\N
2460	22	14	4	ORANGE BRIGHT	H&M	35-316	\N	t	\N	2026-01-05 07:25:09.400993+00	\N
2461	22	14	4	ORANGE BRIGHT	H&M	35-315	\N	t	\N	2026-01-05 07:25:09.408893+00	\N
2462	22	14	5	ORANGE MEDIUM	H&M	35-314	\N	t	\N	2026-01-05 07:25:09.422235+00	\N
2463	22	14	5	ORANGE MEDIUM	H&M	35-313	\N	t	\N	2026-01-05 07:25:09.43008+00	\N
2464	22	14	5	ORANGE MEDIUM	H&M	35-312	\N	t	\N	2026-01-05 07:25:09.440518+00	\N
2465	22	14	5	ORANGE MEDIUM	H&M	35-311	\N	t	\N	2026-01-05 07:25:09.447108+00	\N
2466	22	14	5	ORANGE MEDIUM	H&M	35-310	\N	t	\N	2026-01-05 07:25:09.457058+00	\N
2467	22	14	5	ORANGE MEDIUM	H&M	35-309	\N	t	\N	2026-01-05 07:25:09.463198+00	\N
2468	22	14	5	ORANGE MEDIUM	H&M	35-308	\N	t	\N	2026-01-05 07:25:09.47332+00	\N
2469	22	14	4	ORANGE BRIGHT	H&M	35-307	\N	t	\N	2026-01-05 07:25:09.479922+00	\N
2470	22	14	4	ORANGE BRIGHT	H&M	35-306	\N	t	\N	2026-01-05 07:25:09.489509+00	\N
2471	22	14	5	ORANGE MEDIUM	H&M	35-305	\N	t	\N	2026-01-05 07:25:09.495737+00	\N
2472	22	14	5	ORANGE MEDIUM	H&M	35-304	\N	t	\N	2026-01-05 07:25:09.506855+00	\N
2473	22	14	4	ORANGE BRIGHT	H&M	35-303	\N	t	\N	2026-01-05 07:25:09.514135+00	\N
2474	22	14	4	ORANGE BRIGHT	H&M	35-302	\N	t	\N	2026-01-05 07:25:09.523794+00	\N
2475	22	14	5	ORANGE MEDIUM	H&M	35-301	\N	t	\N	2026-01-05 07:25:09.530832+00	\N
2476	22	14	5	ORANGE MEDIUM	H&M	35-222	\N	t	\N	2026-01-05 07:25:09.541035+00	\N
2477	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-221	\N	t	\N	2026-01-05 07:25:09.548823+00	\N
2478	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-220	\N	t	\N	2026-01-05 07:25:09.55736+00	\N
2479	22	14	5	ORANGE MEDIUM	H&M	35-219	\N	t	\N	2026-01-05 07:25:09.565856+00	\N
2480	22	14	2	ORANGE DARK	H&M	35-218	\N	t	\N	2026-01-05 07:25:09.573633+00	\N
2481	22	14	2	ORANGE DARK	H&M	35-217	\N	t	\N	2026-01-05 07:25:09.580922+00	\N
2482	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-216	\N	t	\N	2026-01-05 07:25:09.594084+00	\N
2483	22	14	4	ORANGE BRIGHT	H&M	35-215	\N	t	\N	2026-01-05 07:25:09.606174+00	\N
2484	22	14	4	ORANGE BRIGHT	H&M	35-214	\N	t	\N	2026-01-05 07:25:09.614134+00	\N
2485	22	14	5	ORANGE MEDIUM	H&M	35-213	\N	t	\N	2026-01-05 07:25:09.627607+00	\N
2486	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-212	\N	t	\N	2026-01-05 07:25:09.638018+00	\N
2487	22	14	5	ORANGE MEDIUM	H&M	35-211	\N	t	\N	2026-01-05 07:25:09.645109+00	\N
2488	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-210	\N	t	\N	2026-01-05 07:25:09.656125+00	\N
2489	22	14	5	ORANGE MEDIUM	H&M	35-209	\N	t	\N	2026-01-05 07:25:09.663921+00	\N
2490	22	14	5	ORANGE MEDIUM	H&M	35-208	\N	t	\N	2026-01-05 07:25:09.675313+00	\N
2491	22	14	6	ORANGE LIGHT	H&M	35-207	\N	t	\N	2026-01-05 07:25:09.68511+00	\N
2492	22	14	5	ORANGE MEDIUM	H&M	35-206	\N	t	\N	2026-01-05 07:25:09.693945+00	\N
2493	22	14	5	ORANGE MEDIUM	H&M	35-205	\N	t	\N	2026-01-05 07:25:09.704658+00	\N
2494	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-204	\N	t	\N	2026-01-05 07:25:09.71257+00	\N
2495	22	14	5	ORANGE MEDIUM	H&M	35-203	\N	t	\N	2026-01-05 07:25:09.723882+00	\N
2496	22	14	5	ORANGE MEDIUM	H&M	35-202	\N	t	\N	2026-01-05 07:25:09.7337+00	\N
2497	22	14	5	ORANGE MEDIUM	H&M	35-201	\N	t	\N	2026-01-05 07:25:09.742093+00	\N
2498	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-117	\N	t	\N	2026-01-05 07:25:09.751171+00	\N
2499	22	14	3	ORANGE DUSTY LIGHT	H&M	35-116	\N	t	\N	2026-01-05 07:25:09.759425+00	\N
2500	22	14	3	ORANGE DUSTY LIGHT	H&M	35-115	\N	t	\N	2026-01-05 07:25:09.769394+00	\N
2501	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-112	\N	t	\N	2026-01-05 07:25:09.777312+00	\N
2502	22	14	3	ORANGE DUSTY LIGHT	H&M	35-111	\N	t	\N	2026-01-05 07:25:09.791836+00	\N
2503	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-110	\N	t	\N	2026-01-05 07:25:09.805547+00	\N
2504	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-107	\N	t	\N	2026-01-05 07:25:09.813645+00	\N
2505	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-106	\N	t	\N	2026-01-05 07:25:09.82494+00	\N
2506	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-105	\N	t	\N	2026-01-05 07:25:09.834377+00	\N
2507	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-104	\N	t	\N	2026-01-05 07:25:09.842904+00	\N
2508	22	14	1	ORANGE MEDIUM DUSTY	H&M	35-103	\N	t	\N	2026-01-05 07:25:09.853056+00	\N
2509	22	14	1	ORANGE MEDIUM DUSTY	H&M	34-311	\N	t	\N	2026-01-05 07:25:09.863882+00	\N
2510	22	14	5	ORANGE MEDIUM	H&M	34-310	\N	t	\N	2026-01-05 07:25:09.877337+00	\N
2511	22	14	6	ORANGE LIGHT	H&M	34-309	\N	t	\N	2026-01-05 07:25:09.888145+00	\N
2512	22	14	6	ORANGE LIGHT	H&M	34-308	\N	t	\N	2026-01-05 07:25:09.895279+00	\N
2513	22	14	5	ORANGE MEDIUM	H&M	34-304	\N	t	\N	2026-01-05 07:25:09.905915+00	\N
2514	22	14	5	ORANGE MEDIUM	H&M	34-301	\N	t	\N	2026-01-05 07:25:09.91298+00	\N
2515	22	14	1	ORANGE MEDIUM DUSTY	H&M	34-217	\N	t	\N	2026-01-05 07:25:09.923804+00	\N
2516	22	14	5	ORANGE MEDIUM	H&M	34-216	\N	t	\N	2026-01-05 07:25:09.93194+00	\N
2517	22	14	6	ORANGE LIGHT	H&M	34-215	\N	t	\N	2026-01-05 07:25:09.941315+00	\N
2518	22	14	3	ORANGE DUSTY LIGHT	H&M	34-214	\N	t	\N	2026-01-05 07:25:09.950914+00	\N
2519	22	14	6	ORANGE LIGHT	H&M	34-213	\N	t	\N	2026-01-05 07:25:09.958881+00	\N
2520	22	14	6	ORANGE LIGHT	H&M	34-212	\N	t	\N	2026-01-05 07:25:09.967708+00	\N
2521	22	14	6	ORANGE LIGHT	H&M	34-211	\N	t	\N	2026-01-05 07:25:09.9755+00	\N
2522	22	14	6	ORANGE LIGHT	H&M	34-210	\N	t	\N	2026-01-05 07:25:09.984356+00	\N
2523	22	14	1	ORANGE MEDIUM DUSTY	H&M	34-209	\N	t	\N	2026-01-05 07:25:09.992143+00	\N
2524	22	14	6	ORANGE LIGHT	H&M	34-208	\N	t	\N	2026-01-05 07:25:10.00115+00	\N
2525	22	14	6	ORANGE LIGHT	H&M	34-207	\N	t	\N	2026-01-05 07:25:10.00887+00	\N
2526	22	14	6	ORANGE LIGHT	H&M	34-206	\N	t	\N	2026-01-05 07:25:10.018113+00	\N
2527	22	14	6	ORANGE LIGHT	H&M	34-205	\N	t	\N	2026-01-05 07:25:10.026845+00	\N
2528	22	14	6	ORANGE LIGHT	H&M	34-204	\N	t	\N	2026-01-05 07:25:10.037144+00	\N
2529	22	14	6	ORANGE LIGHT	H&M	34-203	\N	t	\N	2026-01-05 07:25:10.044132+00	\N
2530	22	14	6	ORANGE LIGHT	H&M	34-202	\N	t	\N	2026-01-05 07:25:10.054246+00	\N
2531	22	14	6	ORANGE LIGHT	H&M	34-201	\N	t	\N	2026-01-05 07:25:10.061357+00	\N
2532	22	14	3	ORANGE DUSTY LIGHT	H&M	34-115	\N	t	\N	2026-01-05 07:25:10.072105+00	\N
2533	22	14	3	ORANGE DUSTY LIGHT	H&M	34-114	\N	t	\N	2026-01-05 07:25:10.079605+00	\N
2534	22	14	3	ORANGE DUSTY LIGHT	H&M	34-113	\N	t	\N	2026-01-05 07:25:10.091764+00	\N
2535	22	14	6	ORANGE LIGHT	H&M	34-112	\N	t	\N	2026-01-05 07:25:10.103503+00	\N
2536	22	14	3	ORANGE DUSTY LIGHT	H&M	34-111	\N	t	\N	2026-01-05 07:25:10.115744+00	\N
2537	22	14	3	ORANGE DUSTY LIGHT	H&M	34-110	\N	t	\N	2026-01-05 07:25:10.135192+00	\N
2538	22	14	3	ORANGE DUSTY LIGHT	H&M	34-109	\N	t	\N	2026-01-05 07:25:10.147762+00	\N
2539	22	14	6	ORANGE LIGHT	H&M	34-108	\N	t	\N	2026-01-05 07:25:10.157291+00	\N
2540	22	14	3	ORANGE DUSTY LIGHT	H&M	34-107	\N	t	\N	2026-01-05 07:25:10.163889+00	\N
2541	22	14	3	ORANGE DUSTY LIGHT	H&M	34-106	\N	t	\N	2026-01-05 07:25:10.173563+00	\N
2542	22	14	3	ORANGE DUSTY LIGHT	H&M	34-105	\N	t	\N	2026-01-05 07:25:10.180536+00	\N
2543	22	14	3	ORANGE DUSTY LIGHT	H&M	34-104	\N	t	\N	2026-01-05 07:25:10.190562+00	\N
2544	22	14	3	ORANGE DUSTY LIGHT	H&M	34-103	\N	t	\N	2026-01-05 07:25:10.199907+00	\N
2545	22	14	3	ORANGE DUSTY LIGHT	H&M	34-102	\N	t	\N	2026-01-05 07:25:10.208568+00	\N
2546	22	14	6	ORANGE LIGHT	H&M	34-101	\N	t	\N	2026-01-05 07:25:10.217324+00	\N
2547	22	14	5	ORANGE MEDIUM	H&M	33-307	\N	t	\N	2026-01-05 07:25:10.224302+00	\N
2548	22	14	2	ORANGE DARK	H&M	33-305	\N	t	\N	2026-01-05 07:25:10.230677+00	\N
2549	22	14	2	ORANGE DARK	H&M	33-303	\N	t	\N	2026-01-05 07:25:10.240415+00	\N
2550	22	14	2	ORANGE DARK	H&M	33-210	\N	t	\N	2026-01-05 07:25:10.247833+00	\N
2551	22	14	2	ORANGE DARK	H&M	33-209	\N	t	\N	2026-01-05 07:25:10.257529+00	\N
2552	22	14	1	ORANGE MEDIUM DUSTY	H&M	33-204	\N	t	\N	2026-01-05 07:25:10.267322+00	\N
2553	22	14	2	ORANGE DARK	H&M	33-202	\N	t	\N	2026-01-05 07:25:10.275038+00	\N
2554	22	14	1	ORANGE MEDIUM DUSTY	H&M	33-104	\N	t	\N	2026-01-05 07:25:10.284106+00	\N
2555	22	14	2	ORANGE DARK	H&M	33-102	\N	t	\N	2026-01-05 07:25:10.29161+00	\N
2556	22	14	4	ORANGE BRIGHT	H&M	32-315	\N	t	\N	2026-01-05 07:25:10.299734+00	\N
2557	22	14	4	ORANGE BRIGHT	H&M	32-314	\N	t	\N	2026-01-05 07:25:10.307051+00	\N
2558	22	14	4	ORANGE BRIGHT	H&M	32-313	\N	t	\N	2026-01-05 07:25:10.313871+00	\N
2559	22	14	4	ORANGE BRIGHT	H&M	32-312	\N	t	\N	2026-01-05 07:25:10.323847+00	\N
2560	22	14	5	ORANGE MEDIUM	H&M	32-310	\N	t	\N	2026-01-05 07:25:10.331553+00	\N
2561	22	14	5	ORANGE MEDIUM	H&M	32-308	\N	t	\N	2026-01-05 07:25:10.34003+00	\N
2562	22	14	5	ORANGE MEDIUM	H&M	32-307	\N	t	\N	2026-01-05 07:25:10.34586+00	\N
2563	22	14	4	ORANGE BRIGHT	H&M	32-305	\N	t	\N	2026-01-05 07:25:10.35524+00	\N
2564	22	14	5	ORANGE MEDIUM	H&M	32-304	\N	t	\N	2026-01-05 07:25:10.361551+00	\N
2565	22	14	5	ORANGE MEDIUM	H&M	32-218	\N	t	\N	2026-01-05 07:25:10.371962+00	\N
2566	22	14	5	ORANGE MEDIUM	H&M	32-217	\N	t	\N	2026-01-05 07:25:10.378488+00	\N
2567	22	14	1	ORANGE MEDIUM DUSTY	H&M	32-216	\N	t	\N	2026-01-05 07:25:10.388782+00	\N
2568	22	14	5	ORANGE MEDIUM	H&M	32-215	\N	t	\N	2026-01-05 07:25:10.395812+00	\N
2569	22	14	1	ORANGE MEDIUM DUSTY	H&M	32-214	\N	t	\N	2026-01-05 07:25:10.406738+00	\N
2570	22	14	5	ORANGE MEDIUM	H&M	32-213	\N	t	\N	2026-01-05 07:25:10.412452+00	\N
2571	22	14	1	ORANGE MEDIUM DUSTY	H&M	32-212	\N	t	\N	2026-01-05 07:25:10.422283+00	\N
2572	22	14	1	ORANGE MEDIUM DUSTY	H&M	32-211	\N	t	\N	2026-01-05 07:25:10.428642+00	\N
2573	22	14	5	ORANGE MEDIUM	H&M	32-208	\N	t	\N	2026-01-05 07:25:10.437864+00	\N
2574	22	14	5	ORANGE MEDIUM	H&M	32-206	\N	t	\N	2026-01-05 07:25:10.444851+00	\N
2575	22	14	1	ORANGE MEDIUM DUSTY	H&M	32-205	\N	t	\N	2026-01-05 07:25:10.454561+00	\N
2576	22	14	3	ORANGE DUSTY LIGHT	H&M	32-103	\N	t	\N	2026-01-05 07:25:10.4614+00	\N
2577	22	14	1	ORANGE MEDIUM DUSTY	H&M	32-101	\N	t	\N	2026-01-05 07:25:10.471562+00	\N
2578	22	14	6	ORANGE LIGHT	H&M	31-306	\N	t	\N	2026-01-05 07:25:10.479147+00	\N
2579	22	14	6	ORANGE LIGHT	H&M	31-305	\N	t	\N	2026-01-05 07:25:10.489718+00	\N
2580	22	14	6	ORANGE LIGHT	H&M	31-304	\N	t	\N	2026-01-05 07:25:10.496363+00	\N
2581	22	14	6	ORANGE LIGHT	H&M	31-303	\N	t	\N	2026-01-05 07:25:10.506287+00	\N
2582	22	14	3	ORANGE DUSTY LIGHT	H&M	31-222	\N	t	\N	2026-01-05 07:25:10.512976+00	\N
2583	22	14	6	ORANGE LIGHT	H&M	31-221	\N	t	\N	2026-01-05 07:25:10.523419+00	\N
2584	22	14	3	ORANGE DUSTY LIGHT	H&M	31-219	\N	t	\N	2026-01-05 07:25:10.530391+00	\N
2585	22	14	3	ORANGE DUSTY LIGHT	H&M	31-218	\N	t	\N	2026-01-05 07:25:10.539987+00	\N
2586	22	14	6	ORANGE LIGHT	H&M	31-217	\N	t	\N	2026-01-05 07:25:10.546777+00	\N
2587	22	14	3	ORANGE DUSTY LIGHT	H&M	31-216	\N	t	\N	2026-01-05 07:25:10.557399+00	\N
2588	22	14	3	ORANGE DUSTY LIGHT	H&M	31-215	\N	t	\N	2026-01-05 07:25:10.566891+00	\N
2589	22	14	3	ORANGE DUSTY LIGHT	H&M	31-214	\N	t	\N	2026-01-05 07:25:10.574415+00	\N
2590	22	14	3	ORANGE DUSTY LIGHT	H&M	31-213	\N	t	\N	2026-01-05 07:25:10.583678+00	\N
2591	22	14	3	ORANGE DUSTY LIGHT	H&M	31-212	\N	t	\N	2026-01-05 07:25:10.591335+00	\N
2592	22	14	6	ORANGE LIGHT	H&M	31-210	\N	t	\N	2026-01-05 07:25:10.60014+00	\N
2593	22	14	3	ORANGE DUSTY LIGHT	H&M	31-209	\N	t	\N	2026-01-05 07:25:10.607691+00	\N
2594	22	14	6	ORANGE LIGHT	H&M	31-208	\N	t	\N	2026-01-05 07:25:10.616665+00	\N
2595	22	14	3	ORANGE DUSTY LIGHT	H&M	31-207	\N	t	\N	2026-01-05 07:25:10.62452+00	\N
2596	22	14	6	ORANGE LIGHT	H&M	31-206	\N	t	\N	2026-01-05 07:25:10.633668+00	\N
2597	22	14	6	ORANGE LIGHT	H&M	31-205	\N	t	\N	2026-01-05 07:25:10.641158+00	\N
2598	22	14	6	ORANGE LIGHT	H&M	31-204	\N	t	\N	2026-01-05 07:25:10.649946+00	\N
2599	22	14	6	ORANGE LIGHT	H&M	31-201	\N	t	\N	2026-01-05 07:25:10.657433+00	\N
2600	22	14	3	ORANGE DUSTY LIGHT	H&M	31-116	\N	t	\N	2026-01-05 07:25:10.66425+00	\N
2601	22	14	3	ORANGE DUSTY LIGHT	H&M	31-115	\N	t	\N	2026-01-05 07:25:10.673377+00	\N
2602	22	14	3	ORANGE DUSTY LIGHT	H&M	31-113	\N	t	\N	2026-01-05 07:25:10.680491+00	\N
2603	22	14	3	ORANGE DUSTY LIGHT	H&M	31-111	\N	t	\N	2026-01-05 07:25:10.690848+00	\N
2604	22	14	3	ORANGE DUSTY LIGHT	H&M	31-110	\N	t	\N	2026-01-05 07:25:10.699871+00	\N
2605	22	14	3	ORANGE DUSTY LIGHT	H&M	31-109	\N	t	\N	2026-01-05 07:25:10.708251+00	\N
2606	22	14	3	ORANGE DUSTY LIGHT	H&M	31-108	\N	t	\N	2026-01-05 07:25:10.719939+00	\N
2607	22	14	3	ORANGE DUSTY LIGHT	H&M	31-107	\N	t	\N	2026-01-05 07:25:10.728342+00	\N
2608	22	14	3	ORANGE DUSTY LIGHT	H&M	31-106	\N	t	\N	2026-01-05 07:25:10.741201+00	\N
2609	22	14	3	ORANGE DUSTY LIGHT	H&M	31-105	\N	t	\N	2026-01-05 07:25:10.751021+00	\N
2610	22	14	3	ORANGE DUSTY LIGHT	H&M	31-104	\N	t	\N	2026-01-05 07:25:10.759527+00	\N
2611	22	14	3	ORANGE DUSTY LIGHT	H&M	31-103	\N	t	\N	2026-01-05 07:25:10.769498+00	\N
2612	22	14	3	ORANGE DUSTY LIGHT	H&M	31-102	\N	t	\N	2026-01-05 07:25:10.776767+00	\N
2613	22	14	3	ORANGE DUSTY LIGHT	H&M	31-101	\N	t	\N	2026-01-05 07:25:10.789486+00	\N
2614	22	14	4	ORANGE BRIGHT	H&M	30-117	\N	t	\N	2026-01-05 07:25:10.79677+00	\N
2615	22	14	4	ORANGE BRIGHT	H&M	30-116	\N	t	\N	2026-01-05 07:25:10.806069+00	\N
2616	22	14	4	ORANGE BRIGHT	H&M	30-115	\N	t	\N	2026-01-05 07:25:10.812126+00	\N
2617	22	14	4	ORANGE BRIGHT	H&M	30-114	\N	t	\N	2026-01-05 07:25:10.821326+00	\N
2618	22	14	4	ORANGE BRIGHT	H&M	30-113	\N	t	\N	2026-01-05 07:25:10.827805+00	\N
2619	22	14	4	ORANGE BRIGHT	H&M	30-112	\N	t	\N	2026-01-05 07:25:10.837031+00	\N
2620	22	14	4	ORANGE BRIGHT	H&M	30-111	\N	t	\N	2026-01-05 07:25:10.843913+00	\N
2621	22	14	4	ORANGE BRIGHT	H&M	30-109	\N	t	\N	2026-01-05 07:25:10.853799+00	\N
2622	22	14	4	ORANGE BRIGHT	H&M	30-108	\N	t	\N	2026-01-05 07:25:10.860869+00	\N
2623	22	14	4	ORANGE BRIGHT	H&M	30-107	\N	t	\N	2026-01-05 07:25:10.8705+00	\N
2624	22	14	4	ORANGE BRIGHT	H&M	30-106	\N	t	\N	2026-01-05 07:25:10.877642+00	\N
2625	22	14	6	ORANGE LIGHT	H&M	30-105	\N	t	\N	2026-01-05 07:25:10.887719+00	\N
2626	22	14	4	ORANGE BRIGHT	H&M	30-104	\N	t	\N	2026-01-05 07:25:10.894685+00	\N
2627	22	14	6	ORANGE LIGHT	H&M	30-103	\N	t	\N	2026-01-05 07:25:10.905587+00	\N
2628	22	14	4	ORANGE BRIGHT	H&M	30-102	\N	t	\N	2026-01-05 07:25:10.912503+00	\N
2629	22	14	4	ORANGE BRIGHT	H&M	30-101	\N	t	\N	2026-01-05 07:25:10.923212+00	\N
2630	22	14	5	ORANGE MEDIUM	H&M	29-307	\N	t	\N	2026-01-05 07:25:10.930931+00	\N
2631	23	15	5	PINK MEDIUM	H&M	62-207	\N	t	\N	2026-01-05 07:25:10.940185+00	\N
2632	23	15	5	PINK MEDIUM	H&M	62-202	\N	t	\N	2026-01-05 07:25:10.950348+00	\N
2633	23	15	5	PINK MEDIUM	H&M	62-201	\N	t	\N	2026-01-05 07:25:10.95836+00	\N
2634	23	15	6	PINK LIGHT	H&M	61-203	\N	t	\N	2026-01-05 07:25:10.967152+00	\N
2635	23	15	6	PINK LIGHT	H&M	61-201	\N	t	\N	2026-01-05 07:25:10.975278+00	\N
2636	23	15	3	PINK DUSTY LIGHT	H&M	61-104	\N	t	\N	2026-01-05 07:25:10.98515+00	\N
2637	23	15	2	PINK DARK	H&M	59-308	\N	t	\N	2026-01-05 07:25:10.992527+00	\N
2638	23	15	2	PINK DARK	H&M	59-307	\N	t	\N	2026-01-05 07:25:11.002981+00	\N
2639	23	15	2	PINK DARK	H&M	59-306	\N	t	\N	2026-01-05 07:25:11.010137+00	\N
2640	23	15	2	PINK DARK	H&M	59-305	\N	t	\N	2026-01-05 07:25:11.01972+00	\N
2641	23	15	2	PINK DARK	H&M	59-303	\N	t	\N	2026-01-05 07:25:11.02671+00	\N
2642	23	15	2	PINK DARK	H&M	59-302	\N	t	\N	2026-01-05 07:25:11.036093+00	\N
2643	23	15	2	PINK DARK	H&M	59-301	\N	t	\N	2026-01-05 07:25:11.043144+00	\N
2644	23	15	2	PINK DARK	H&M	59-211	\N	t	\N	2026-01-05 07:25:11.052572+00	\N
2645	23	15	2	PINK DARK	H&M	59-208	\N	t	\N	2026-01-05 07:25:11.059772+00	\N
2646	23	15	5	PINK MEDIUM	H&M	59-207	\N	t	\N	2026-01-05 07:25:11.070032+00	\N
2647	23	15	5	PINK MEDIUM	H&M	58-314	\N	t	\N	2026-01-05 07:25:11.077278+00	\N
2648	23	15	5	PINK MEDIUM	H&M	58-313	\N	t	\N	2026-01-05 07:25:11.087632+00	\N
2649	23	15	4	PINK BRIGHT	H&M	58-311	\N	t	\N	2026-01-05 07:25:11.09513+00	\N
2650	23	15	4	PINK BRIGHT	H&M	58-310	\N	t	\N	2026-01-05 07:25:11.105856+00	\N
2651	23	15	4	PINK BRIGHT	H&M	58-309	\N	t	\N	2026-01-05 07:25:11.112551+00	\N
2652	23	15	4	PINK BRIGHT	H&M	58-308	\N	t	\N	2026-01-05 07:25:11.122493+00	\N
2653	23	15	5	PINK MEDIUM	H&M	58-307	\N	t	\N	2026-01-05 07:25:11.12924+00	\N
2654	23	15	5	PINK MEDIUM	H&M	58-306	\N	t	\N	2026-01-05 07:25:11.139127+00	\N
2655	23	15	5	PINK MEDIUM	H&M	58-305	\N	t	\N	2026-01-05 07:25:11.145587+00	\N
2656	23	15	4	PINK BRIGHT	H&M	58-304	\N	t	\N	2026-01-05 07:25:11.155276+00	\N
2657	23	15	5	PINK MEDIUM	H&M	58-303	\N	t	\N	2026-01-05 07:25:11.161939+00	\N
2658	23	15	5	PINK MEDIUM	H&M	58-302	\N	t	\N	2026-01-05 07:25:11.171871+00	\N
2659	23	15	4	PINK BRIGHT	H&M	58-301	\N	t	\N	2026-01-05 07:25:11.178731+00	\N
2660	23	15	5	PINK MEDIUM	H&M	58-207	\N	t	\N	2026-01-05 07:25:11.18941+00	\N
2661	23	15	5	PINK MEDIUM	H&M	58-206	\N	t	\N	2026-01-05 07:25:11.19615+00	\N
2662	23	15	5	PINK MEDIUM	H&M	58-205	\N	t	\N	2026-01-05 07:25:11.206033+00	\N
2663	23	15	5	PINK MEDIUM	H&M	58-202	\N	t	\N	2026-01-05 07:25:11.212946+00	\N
2664	23	15	6	PINK LIGHT	H&M	58-201	\N	t	\N	2026-01-05 07:25:11.222691+00	\N
2665	23	15	3	PINK DUSTY LIGHT	H&M	58-107	\N	t	\N	2026-01-05 07:25:11.229459+00	\N
2666	23	15	1	PINK MEDIUM DUSTY	H&M	58-106	\N	t	\N	2026-01-05 07:25:11.239159+00	\N
2667	23	15	1	PINK MEDIUM DUSTY	H&M	58-105	\N	t	\N	2026-01-05 07:25:11.245663+00	\N
2668	23	15	1	PINK MEDIUM DUSTY	H&M	58-104	\N	t	\N	2026-01-05 07:25:11.255892+00	\N
2669	23	15	1	PINK MEDIUM DUSTY	H&M	58-103	\N	t	\N	2026-01-05 07:25:11.263897+00	\N
2670	23	15	1	PINK MEDIUM DUSTY	H&M	58-102	\N	t	\N	2026-01-05 07:25:11.273737+00	\N
2671	23	15	1	PINK MEDIUM DUSTY	H&M	58-101	\N	t	\N	2026-01-05 07:25:11.28199+00	\N
2672	23	15	6	PINK LIGHT	H&M	57-304	\N	t	\N	2026-01-05 07:25:11.290125+00	\N
2673	23	15	5	PINK MEDIUM	H&M	57-303	\N	t	\N	2026-01-05 07:25:11.298118+00	\N
2674	23	15	6	PINK LIGHT	H&M	57-302	\N	t	\N	2026-01-05 07:25:11.306679+00	\N
2675	23	15	4	PINK BRIGHT	H&M	57-301	\N	t	\N	2026-01-05 07:25:11.314297+00	\N
2676	23	15	1	PINK MEDIUM DUSTY	H&M	57-208	\N	t	\N	2026-01-05 07:25:11.323142+00	\N
2677	23	15	6	PINK LIGHT	H&M	57-207	\N	t	\N	2026-01-05 07:25:11.33057+00	\N
2678	23	15	6	PINK LIGHT	H&M	57-206	\N	t	\N	2026-01-05 07:25:11.339646+00	\N
2679	23	15	6	PINK LIGHT	H&M	57-205	\N	t	\N	2026-01-05 07:25:11.346383+00	\N
2680	23	15	6	PINK LIGHT	H&M	57-204	\N	t	\N	2026-01-05 07:25:11.356406+00	\N
2681	23	15	6	PINK LIGHT	H&M	57-203	\N	t	\N	2026-01-05 07:25:11.36359+00	\N
2682	23	15	6	PINK LIGHT	H&M	57-202	\N	t	\N	2026-01-05 07:25:11.372744+00	\N
2683	23	15	6	PINK LIGHT	H&M	57-201	\N	t	\N	2026-01-05 07:25:11.378905+00	\N
2684	23	15	1	PINK MEDIUM DUSTY	H&M	57-111	\N	t	\N	2026-01-05 07:25:11.388898+00	\N
2685	23	15	3	PINK DUSTY LIGHT	H&M	57-110	\N	t	\N	2026-01-05 07:25:11.395793+00	\N
2686	23	15	3	PINK DUSTY LIGHT	H&M	57-109	\N	t	\N	2026-01-05 07:25:11.405831+00	\N
2687	23	15	3	PINK DUSTY LIGHT	H&M	57-108	\N	t	\N	2026-01-05 07:25:11.412472+00	\N
2688	23	15	3	PINK DUSTY LIGHT	H&M	57-107	\N	t	\N	2026-01-05 07:25:11.423175+00	\N
2689	23	15	6	PINK LIGHT	H&M	57-106	\N	t	\N	2026-01-05 07:25:11.429933+00	\N
2690	23	15	3	PINK DUSTY LIGHT	H&M	57-105	\N	t	\N	2026-01-05 07:25:11.441004+00	\N
2691	23	15	6	PINK LIGHT	H&M	57-104	\N	t	\N	2026-01-05 07:25:11.450184+00	\N
2692	23	15	3	PINK DUSTY LIGHT	H&M	57-103	\N	t	\N	2026-01-05 07:25:11.457921+00	\N
2693	23	15	3	PINK DUSTY LIGHT	H&M	57-102	\N	t	\N	2026-01-05 07:25:11.466759+00	\N
2694	23	15	3	PINK DUSTY LIGHT	H&M	57-101	\N	t	\N	2026-01-05 07:25:11.474693+00	\N
2695	23	15	4	PINK BRIGHT	H&M	56-322	\N	t	\N	2026-01-05 07:25:11.483167+00	\N
2696	23	15	4	PINK BRIGHT	H&M	56-321	\N	t	\N	2026-01-05 07:25:11.490334+00	\N
2697	23	15	4	PINK BRIGHT	H&M	56-320	\N	t	\N	2026-01-05 07:25:11.497655+00	\N
2698	23	15	4	PINK BRIGHT	H&M	56-319	\N	t	\N	2026-01-05 07:25:11.506495+00	\N
2699	23	15	4	PINK BRIGHT	H&M	56-318	\N	t	\N	2026-01-05 07:25:11.513258+00	\N
2700	23	15	4	PINK BRIGHT	H&M	56-317	\N	t	\N	2026-01-05 07:25:11.522126+00	\N
2701	23	15	4	PINK BRIGHT	H&M	56-316	\N	t	\N	2026-01-05 07:25:11.528461+00	\N
2702	23	15	2	PINK DARK	H&M	56-315	\N	t	\N	2026-01-05 07:25:11.538166+00	\N
2703	23	15	2	PINK DARK	H&M	56-314	\N	t	\N	2026-01-05 07:25:11.544848+00	\N
2704	23	15	4	PINK BRIGHT	H&M	56-313	\N	t	\N	2026-01-05 07:25:11.554814+00	\N
2705	23	15	4	PINK BRIGHT	H&M	56-312	\N	t	\N	2026-01-05 07:25:11.561597+00	\N
2706	23	15	2	PINK DARK	H&M	56-311	\N	t	\N	2026-01-05 07:25:11.57162+00	\N
2707	23	15	4	PINK BRIGHT	H&M	56-310	\N	t	\N	2026-01-05 07:25:11.5783+00	\N
2708	23	15	4	PINK BRIGHT	H&M	56-309	\N	t	\N	2026-01-05 07:25:11.588586+00	\N
2709	23	15	4	PINK BRIGHT	H&M	56-308	\N	t	\N	2026-01-05 07:25:11.595678+00	\N
2710	23	15	4	PINK BRIGHT	H&M	56-307	\N	t	\N	2026-01-05 07:25:11.60625+00	\N
2711	23	15	4	PINK BRIGHT	H&M	56-306	\N	t	\N	2026-01-05 07:25:11.615543+00	\N
2712	23	15	4	PINK BRIGHT	H&M	56-305	\N	t	\N	2026-01-05 07:25:11.623905+00	\N
2713	23	15	5	PINK MEDIUM	H&M	56-304	\N	t	\N	2026-01-05 07:25:11.632894+00	\N
2714	23	15	4	PINK BRIGHT	H&M	56-303	\N	t	\N	2026-01-05 07:25:11.640444+00	\N
2715	23	15	4	PINK BRIGHT	H&M	56-302	\N	t	\N	2026-01-05 07:25:11.649324+00	\N
2716	23	15	4	PINK BRIGHT	H&M	56-301	\N	t	\N	2026-01-05 07:25:11.657054+00	\N
2717	23	15	2	PINK DARK	H&M	56-221	\N	t	\N	2026-01-05 07:25:11.665925+00	\N
2718	23	15	4	PINK BRIGHT	H&M	56-220	\N	t	\N	2026-01-05 07:25:11.673733+00	\N
2719	23	15	5	PINK MEDIUM	H&M	56-219	\N	t	\N	2026-01-05 07:25:11.682943+00	\N
2720	23	15	2	PINK DARK	H&M	56-218	\N	t	\N	2026-01-05 07:25:11.690678+00	\N
2721	23	15	2	PINK DARK	H&M	56-216	\N	t	\N	2026-01-05 07:25:11.699304+00	\N
2722	23	15	2	PINK DARK	H&M	56-215	\N	t	\N	2026-01-05 07:25:11.706869+00	\N
2723	23	15	2	PINK DARK	H&M	56-214	\N	t	\N	2026-01-05 07:25:11.715465+00	\N
2724	23	15	2	PINK DARK	H&M	56-213	\N	t	\N	2026-01-05 07:25:11.723703+00	\N
2725	23	15	2	PINK DARK	H&M	56-212	\N	t	\N	2026-01-05 07:25:11.733123+00	\N
2726	23	15	2	PINK DARK	H&M	56-211	\N	t	\N	2026-01-05 07:25:11.740873+00	\N
2727	23	15	1	PINK MEDIUM DUSTY	H&M	56-210	\N	t	\N	2026-01-05 07:25:11.750129+00	\N
2728	23	15	2	PINK DARK	H&M	56-208	\N	t	\N	2026-01-05 07:25:11.758079+00	\N
2729	23	15	2	PINK DARK	H&M	56-207	\N	t	\N	2026-01-05 07:25:11.766743+00	\N
2730	23	15	2	PINK DARK	H&M	56-206	\N	t	\N	2026-01-05 07:25:11.775281+00	\N
2731	23	15	2	PINK DARK	H&M	56-205	\N	t	\N	2026-01-05 07:25:11.784075+00	\N
2732	23	15	2	PINK DARK	H&M	56-204	\N	t	\N	2026-01-05 07:25:11.792577+00	\N
2733	23	15	1	PINK MEDIUM DUSTY	H&M	56-203	\N	t	\N	2026-01-05 07:25:11.802023+00	\N
2734	23	15	2	PINK DARK	H&M	56-202	\N	t	\N	2026-01-05 07:25:11.809557+00	\N
2735	23	15	6	PINK LIGHT	H&M	56-201	\N	t	\N	2026-01-05 07:25:11.819185+00	\N
2736	23	15	1	PINK MEDIUM DUSTY	H&M	56-112	\N	t	\N	2026-01-05 07:25:11.826497+00	\N
2737	23	15	1	PINK MEDIUM DUSTY	H&M	56-111	\N	t	\N	2026-01-05 07:25:11.836092+00	\N
2738	23	15	1	PINK MEDIUM DUSTY	H&M	56-110	\N	t	\N	2026-01-05 07:25:11.843211+00	\N
2739	23	15	2	PINK DARK	H&M	56-109	\N	t	\N	2026-01-05 07:25:11.852932+00	\N
2740	23	15	2	PINK DARK	H&M	56-108	\N	t	\N	2026-01-05 07:25:11.859718+00	\N
2741	23	15	2	PINK DARK	H&M	56-107	\N	t	\N	2026-01-05 07:25:11.868916+00	\N
2742	23	15	1	PINK MEDIUM DUSTY	H&M	56-106	\N	t	\N	2026-01-05 07:25:11.876182+00	\N
2743	23	15	2	PINK DARK	H&M	56-104	\N	t	\N	2026-01-05 07:25:11.885946+00	\N
2744	23	15	5	PINK MEDIUM	H&M	55-314	\N	t	\N	2026-01-05 07:25:11.892986+00	\N
2745	23	15	5	PINK MEDIUM	H&M	55-313	\N	t	\N	2026-01-05 07:25:11.902345+00	\N
2746	23	15	4	PINK BRIGHT	H&M	55-312	\N	t	\N	2026-01-05 07:25:11.909456+00	\N
2747	23	15	4	PINK BRIGHT	H&M	55-311	\N	t	\N	2026-01-05 07:25:11.918864+00	\N
2748	23	15	5	PINK MEDIUM	H&M	55-310	\N	t	\N	2026-01-05 07:25:11.925856+00	\N
2749	23	15	5	PINK MEDIUM	H&M	55-309	\N	t	\N	2026-01-05 07:25:11.935072+00	\N
2750	23	15	5	PINK MEDIUM	H&M	55-308	\N	t	\N	2026-01-05 07:25:11.942448+00	\N
2751	23	15	5	PINK MEDIUM	H&M	55-307	\N	t	\N	2026-01-05 07:25:11.952965+00	\N
2752	23	15	5	PINK MEDIUM	H&M	55-306	\N	t	\N	2026-01-05 07:25:11.960263+00	\N
2753	23	15	5	PINK MEDIUM	H&M	55-305	\N	t	\N	2026-01-05 07:25:11.969756+00	\N
2754	23	15	5	PINK MEDIUM	H&M	55-304	\N	t	\N	2026-01-05 07:25:11.976547+00	\N
2755	23	15	4	PINK BRIGHT	H&M	55-303	\N	t	\N	2026-01-05 07:25:11.986397+00	\N
2756	23	15	5	PINK MEDIUM	H&M	55-302	\N	t	\N	2026-01-05 07:25:11.993515+00	\N
2757	23	15	5	PINK MEDIUM	H&M	55-301	\N	t	\N	2026-01-05 07:25:12.003638+00	\N
2758	23	15	4	PINK BRIGHT	H&M	55-220	\N	t	\N	2026-01-05 07:25:12.010519+00	\N
2759	23	15	5	PINK MEDIUM	H&M	55-219	\N	t	\N	2026-01-05 07:25:12.020262+00	\N
2760	23	15	5	PINK MEDIUM	H&M	55-217	\N	t	\N	2026-01-05 07:25:12.027482+00	\N
2761	23	15	6	PINK LIGHT	H&M	55-216	\N	t	\N	2026-01-05 07:25:12.037514+00	\N
2762	23	15	5	PINK MEDIUM	H&M	55-215	\N	t	\N	2026-01-05 07:25:12.044146+00	\N
2763	23	15	5	PINK MEDIUM	H&M	55-214	\N	t	\N	2026-01-05 07:25:12.053878+00	\N
2764	23	15	5	PINK MEDIUM	H&M	55-213	\N	t	\N	2026-01-05 07:25:12.060579+00	\N
2765	23	15	6	PINK LIGHT	H&M	55-212	\N	t	\N	2026-01-05 07:25:12.069945+00	\N
2766	23	15	1	PINK MEDIUM DUSTY	H&M	55-211	\N	t	\N	2026-01-05 07:25:12.076339+00	\N
2767	23	15	5	PINK MEDIUM	H&M	55-210	\N	t	\N	2026-01-05 07:25:12.085414+00	\N
2768	23	15	5	PINK MEDIUM	H&M	55-209	\N	t	\N	2026-01-05 07:25:12.092403+00	\N
2769	23	15	5	PINK MEDIUM	H&M	55-208	\N	t	\N	2026-01-05 07:25:12.101979+00	\N
2770	23	15	5	PINK MEDIUM	H&M	55-207	\N	t	\N	2026-01-05 07:25:12.109391+00	\N
2771	23	15	5	PINK MEDIUM	H&M	55-206	\N	t	\N	2026-01-05 07:25:12.118856+00	\N
2772	23	15	5	PINK MEDIUM	H&M	55-205	\N	t	\N	2026-01-05 07:25:12.126241+00	\N
2773	23	15	6	PINK LIGHT	H&M	55-204	\N	t	\N	2026-01-05 07:25:12.136473+00	\N
2774	23	15	5	PINK MEDIUM	H&M	55-203	\N	t	\N	2026-01-05 07:25:12.143686+00	\N
2775	23	15	5	PINK MEDIUM	H&M	55-202	\N	t	\N	2026-01-05 07:25:12.153125+00	\N
2776	23	15	5	PINK MEDIUM	H&M	55-201	\N	t	\N	2026-01-05 07:25:12.160503+00	\N
2777	23	15	1	PINK MEDIUM DUSTY	H&M	55-110	\N	t	\N	2026-01-05 07:25:12.17048+00	\N
2778	23	15	1	PINK MEDIUM DUSTY	H&M	55-109	\N	t	\N	2026-01-05 07:25:12.177548+00	\N
2779	23	15	1	PINK MEDIUM DUSTY	H&M	55-108	\N	t	\N	2026-01-05 07:25:12.188415+00	\N
2780	23	15	1	PINK MEDIUM DUSTY	H&M	55-107	\N	t	\N	2026-01-05 07:25:12.195367+00	\N
2781	23	15	1	PINK MEDIUM DUSTY	H&M	55-106	\N	t	\N	2026-01-05 07:25:12.204906+00	\N
2782	23	15	1	PINK MEDIUM DUSTY	H&M	55-105	\N	t	\N	2026-01-05 07:25:12.211565+00	\N
2783	23	15	1	PINK MEDIUM DUSTY	H&M	55-104	\N	t	\N	2026-01-05 07:25:12.221256+00	\N
2784	23	15	3	PINK DUSTY LIGHT	H&M	55-103	\N	t	\N	2026-01-05 07:25:12.228235+00	\N
2785	23	15	1	PINK MEDIUM DUSTY	H&M	55-102	\N	t	\N	2026-01-05 07:25:12.237747+00	\N
2786	23	15	1	PINK MEDIUM DUSTY	H&M	55-101	\N	t	\N	2026-01-05 07:25:12.244615+00	\N
2787	23	15	6	PINK LIGHT	H&M	54-303	\N	t	\N	2026-01-05 07:25:12.254436+00	\N
2788	23	15	6	PINK LIGHT	H&M	54-302	\N	t	\N	2026-01-05 07:25:12.261553+00	\N
2789	23	15	6	PINK LIGHT	H&M	54-301	\N	t	\N	2026-01-05 07:25:12.271651+00	\N
2790	23	15	6	PINK LIGHT	H&M	54-299	\N	t	\N	2026-01-05 07:25:12.278163+00	\N
2791	23	15	6	PINK LIGHT	H&M	54-298	\N	t	\N	2026-01-05 07:25:12.288086+00	\N
2792	23	15	6	PINK LIGHT	H&M	54-216	\N	t	\N	2026-01-05 07:25:12.294349+00	\N
2793	23	15	6	PINK LIGHT	H&M	54-215	\N	t	\N	2026-01-05 07:25:12.30449+00	\N
2794	23	15	6	PINK LIGHT	H&M	54-214	\N	t	\N	2026-01-05 07:25:12.311509+00	\N
2795	23	15	6	PINK LIGHT	H&M	54-213	\N	t	\N	2026-01-05 07:25:12.321264+00	\N
2796	23	15	6	PINK LIGHT	H&M	54-212	\N	t	\N	2026-01-05 07:25:12.327455+00	\N
2797	23	15	6	PINK LIGHT	H&M	54-211	\N	t	\N	2026-01-05 07:25:12.336817+00	\N
2798	23	15	6	PINK LIGHT	H&M	54-210	\N	t	\N	2026-01-05 07:25:12.343127+00	\N
2799	23	15	6	PINK LIGHT	H&M	54-209	\N	t	\N	2026-01-05 07:25:12.352302+00	\N
2800	23	15	6	PINK LIGHT	H&M	54-208	\N	t	\N	2026-01-05 07:25:12.358932+00	\N
2801	23	15	6	PINK LIGHT	H&M	54-207	\N	t	\N	2026-01-05 07:25:12.367584+00	\N
2802	23	15	6	PINK LIGHT	H&M	54-206	\N	t	\N	2026-01-05 07:25:12.374401+00	\N
2803	23	15	6	PINK LIGHT	H&M	54-205	\N	t	\N	2026-01-05 07:25:12.383177+00	\N
2804	23	15	6	PINK LIGHT	H&M	54-204	\N	t	\N	2026-01-05 07:25:12.390644+00	\N
2805	23	15	6	PINK LIGHT	H&M	54-203	\N	t	\N	2026-01-05 07:25:12.399249+00	\N
2806	23	15	6	PINK LIGHT	H&M	54-202	\N	t	\N	2026-01-05 07:25:12.406752+00	\N
2807	23	15	6	PINK LIGHT	H&M	54-201	\N	t	\N	2026-01-05 07:25:12.415913+00	\N
2808	23	15	6	PINK LIGHT	H&M	54-118	\N	t	\N	2026-01-05 07:25:12.423704+00	\N
2809	23	15	6	PINK LIGHT	H&M	54-117	\N	t	\N	2026-01-05 07:25:12.432531+00	\N
2810	23	15	6	PINK LIGHT	H&M	54-116	\N	t	\N	2026-01-05 07:25:12.43958+00	\N
2811	23	15	6	PINK LIGHT	H&M	54-115	\N	t	\N	2026-01-05 07:25:12.448749+00	\N
2812	23	15	3	PINK DUSTY LIGHT	H&M	54-114	\N	t	\N	2026-01-05 07:25:12.456192+00	\N
2813	23	15	3	PINK DUSTY LIGHT	H&M	54-113	\N	t	\N	2026-01-05 07:25:12.462311+00	\N
2814	23	15	3	PINK DUSTY LIGHT	H&M	54-112	\N	t	\N	2026-01-05 07:25:12.473412+00	\N
2815	23	15	3	PINK DUSTY LIGHT	H&M	54-111	\N	t	\N	2026-01-05 07:25:12.482128+00	\N
2816	23	15	3	PINK DUSTY LIGHT	H&M	54-110	\N	t	\N	2026-01-05 07:25:12.490506+00	\N
2817	23	15	3	PINK DUSTY LIGHT	H&M	54-109	\N	t	\N	2026-01-05 07:25:12.499235+00	\N
2818	23	15	6	PINK LIGHT	H&M	54-108	\N	t	\N	2026-01-05 07:25:12.506834+00	\N
2819	23	15	6	PINK LIGHT	H&M	54-107	\N	t	\N	2026-01-05 07:25:12.515368+00	\N
2820	23	15	3	PINK DUSTY LIGHT	H&M	54-106	\N	t	\N	2026-01-05 07:25:12.523767+00	\N
2821	23	15	3	PINK DUSTY LIGHT	H&M	54-105	\N	t	\N	2026-01-05 07:25:12.532397+00	\N
2822	23	15	3	PINK DUSTY LIGHT	H&M	54-104	\N	t	\N	2026-01-05 07:25:12.540305+00	\N
2823	23	15	3	PINK DUSTY LIGHT	H&M	54-103	\N	t	\N	2026-01-05 07:25:12.549114+00	\N
2824	23	15	6	PINK LIGHT	H&M	54-102	\N	t	\N	2026-01-05 07:25:12.556716+00	\N
2825	23	15	3	PINK DUSTY LIGHT	H&M	54-101	\N	t	\N	2026-01-05 07:25:12.565775+00	\N
2826	23	15	4	PINK BRIGHT	H&M	53-317	\N	t	\N	2026-01-05 07:25:12.573392+00	\N
2827	23	15	2	PINK DARK	H&M	53-316	\N	t	\N	2026-01-05 07:25:12.583207+00	\N
2828	23	15	4	PINK BRIGHT	H&M	53-315	\N	t	\N	2026-01-05 07:25:12.590615+00	\N
2829	23	15	4	PINK BRIGHT	H&M	53-314	\N	t	\N	2026-01-05 07:25:12.5986+00	\N
2830	23	15	2	PINK DARK	H&M	53-312	\N	t	\N	2026-01-05 07:25:12.605881+00	\N
2831	23	15	2	PINK DARK	H&M	53-311	\N	t	\N	2026-01-05 07:25:12.614409+00	\N
2832	23	15	4	PINK BRIGHT	H&M	53-309	\N	t	\N	2026-01-05 07:25:12.624823+00	\N
2833	23	15	4	PINK BRIGHT	H&M	53-308	\N	t	\N	2026-01-05 07:25:12.645252+00	\N
2834	23	15	4	PINK BRIGHT	H&M	53-307	\N	t	\N	2026-01-05 07:25:12.665649+00	\N
2835	23	15	4	PINK BRIGHT	H&M	53-306	\N	t	\N	2026-01-05 07:25:12.674957+00	\N
2836	23	15	2	PINK DARK	H&M	53-212	\N	t	\N	2026-01-05 07:25:12.683247+00	\N
2837	23	15	2	PINK DARK	H&M	53-211	\N	t	\N	2026-01-05 07:25:12.692396+00	\N
2838	23	15	4	PINK BRIGHT	H&M	53-210	\N	t	\N	2026-01-05 07:25:12.705218+00	\N
2839	23	15	5	PINK MEDIUM	H&M	53-209	\N	t	\N	2026-01-05 07:25:12.711507+00	\N
2840	23	15	4	PINK BRIGHT	H&M	53-208	\N	t	\N	2026-01-05 07:25:12.727885+00	\N
2841	23	15	5	PINK MEDIUM	H&M	53-207	\N	t	\N	2026-01-05 07:25:12.749263+00	\N
2842	23	15	5	PINK MEDIUM	H&M	53-205	\N	t	\N	2026-01-05 07:25:12.75581+00	\N
2843	23	15	2	PINK DARK	H&M	53-202	\N	t	\N	2026-01-05 07:25:12.761665+00	\N
2844	23	15	2	PINK DARK	H&M	53-201	\N	t	\N	2026-01-05 07:25:12.770271+00	\N
2845	23	15	1	PINK MEDIUM DUSTY	H&M	53-108	\N	t	\N	2026-01-05 07:25:12.775874+00	\N
2846	23	15	2	PINK DARK	H&M	53-107	\N	t	\N	2026-01-05 07:25:12.783742+00	\N
2847	23	15	2	PINK DARK	H&M	53-106	\N	t	\N	2026-01-05 07:25:12.790102+00	\N
2848	23	15	1	PINK MEDIUM DUSTY	H&M	53-105	\N	t	\N	2026-01-05 07:25:12.799035+00	\N
2849	23	15	2	PINK DARK	H&M	53-104	\N	t	\N	2026-01-05 07:25:12.807327+00	\N
2850	23	15	2	PINK DARK	H&M	53-103	\N	t	\N	2026-01-05 07:25:12.817785+00	\N
2851	23	15	4	PINK BRIGHT	H&M	52-311	\N	t	\N	2026-01-05 07:25:12.826111+00	\N
2852	23	15	5	PINK MEDIUM	H&M	52-310	\N	t	\N	2026-01-05 07:25:12.837776+00	\N
2853	23	15	5	PINK MEDIUM	H&M	52-309	\N	t	\N	2026-01-05 07:25:12.849407+00	\N
2854	23	15	5	PINK MEDIUM	H&M	52-308	\N	t	\N	2026-01-05 07:25:12.857225+00	\N
2855	23	15	4	PINK BRIGHT	H&M	52-307	\N	t	\N	2026-01-05 07:25:12.866037+00	\N
2856	23	15	5	PINK MEDIUM	H&M	52-306	\N	t	\N	2026-01-05 07:25:12.873935+00	\N
2857	23	15	5	PINK MEDIUM	H&M	52-305	\N	t	\N	2026-01-05 07:25:12.882981+00	\N
2858	23	15	4	PINK BRIGHT	H&M	52-304	\N	t	\N	2026-01-05 07:25:12.889563+00	\N
2859	23	15	5	PINK MEDIUM	H&M	52-303	\N	t	\N	2026-01-05 07:25:12.896021+00	\N
2860	23	15	4	PINK BRIGHT	H&M	52-302	\N	t	\N	2026-01-05 07:25:12.905378+00	\N
2861	23	15	4	PINK BRIGHT	H&M	52-301	\N	t	\N	2026-01-05 07:25:12.911415+00	\N
2862	23	15	4	PINK BRIGHT	H&M	52-218	\N	t	\N	2026-01-05 07:25:12.920653+00	\N
2863	23	15	5	PINK MEDIUM	H&M	52-217	\N	t	\N	2026-01-05 07:25:12.926909+00	\N
2864	23	15	6	PINK LIGHT	H&M	52-216	\N	t	\N	2026-01-05 07:25:12.936325+00	\N
2865	23	15	6	PINK LIGHT	H&M	52-215	\N	t	\N	2026-01-05 07:25:12.942796+00	\N
2866	23	15	5	PINK MEDIUM	H&M	52-214	\N	t	\N	2026-01-05 07:25:12.951879+00	\N
2867	23	15	6	PINK LIGHT	H&M	52-213	\N	t	\N	2026-01-05 07:25:12.95856+00	\N
2868	23	15	6	PINK LIGHT	H&M	52-212	\N	t	\N	2026-01-05 07:25:12.966832+00	\N
2869	23	15	6	PINK LIGHT	H&M	52-211	\N	t	\N	2026-01-05 07:25:12.973553+00	\N
2870	23	15	5	PINK MEDIUM	H&M	52-209	\N	t	\N	2026-01-05 07:25:12.981119+00	\N
2871	23	15	5	PINK MEDIUM	H&M	52-208	\N	t	\N	2026-01-05 07:25:12.98887+00	\N
2872	23	15	5	PINK MEDIUM	H&M	52-207	\N	t	\N	2026-01-05 07:25:12.995137+00	\N
2873	23	15	6	PINK LIGHT	H&M	52-206	\N	t	\N	2026-01-05 07:25:13.005024+00	\N
2874	23	15	1	PINK MEDIUM DUSTY	H&M	52-205	\N	t	\N	2026-01-05 07:25:13.012006+00	\N
2875	23	15	5	PINK MEDIUM	H&M	52-204	\N	t	\N	2026-01-05 07:25:13.021642+00	\N
2876	23	15	5	PINK MEDIUM	H&M	52-203	\N	t	\N	2026-01-05 07:25:13.027791+00	\N
2877	23	15	5	PINK MEDIUM	H&M	52-202	\N	t	\N	2026-01-05 07:25:13.037464+00	\N
2878	23	15	6	PINK LIGHT	H&M	52-201	\N	t	\N	2026-01-05 07:25:13.043679+00	\N
2879	23	15	1	PINK MEDIUM DUSTY	H&M	52-120	\N	t	\N	2026-01-05 07:25:13.053763+00	\N
2880	23	15	1	PINK MEDIUM DUSTY	H&M	52-119	\N	t	\N	2026-01-05 07:25:13.060313+00	\N
2881	23	15	1	PINK MEDIUM DUSTY	H&M	52-118	\N	t	\N	2026-01-05 07:25:13.069326+00	\N
2882	23	15	3	PINK DUSTY LIGHT	H&M	52-117	\N	t	\N	2026-01-05 07:25:13.075787+00	\N
2883	23	15	1	PINK MEDIUM DUSTY	H&M	52-116	\N	t	\N	2026-01-05 07:25:13.085241+00	\N
2884	23	15	1	PINK MEDIUM DUSTY	H&M	52-115	\N	t	\N	2026-01-05 07:25:13.091304+00	\N
2885	23	15	3	PINK DUSTY LIGHT	H&M	52-114	\N	t	\N	2026-01-05 07:25:13.099294+00	\N
2886	23	15	1	PINK MEDIUM DUSTY	H&M	52-113	\N	t	\N	2026-01-05 07:25:13.106454+00	\N
2887	23	15	1	PINK MEDIUM DUSTY	H&M	52-110	\N	t	\N	2026-01-05 07:25:13.113858+00	\N
2888	23	15	1	PINK MEDIUM DUSTY	H&M	52-109	\N	t	\N	2026-01-05 07:25:13.122149+00	\N
2889	23	15	1	PINK MEDIUM DUSTY	H&M	52-108	\N	t	\N	2026-01-05 07:25:13.128326+00	\N
2890	23	15	5	PINK MEDIUM	H&M	52-107	\N	t	\N	2026-01-05 07:25:13.137896+00	\N
2891	23	15	3	PINK DUSTY LIGHT	H&M	52-106	\N	t	\N	2026-01-05 07:25:13.144168+00	\N
2892	23	15	1	PINK MEDIUM DUSTY	H&M	52-105	\N	t	\N	2026-01-05 07:25:13.153829+00	\N
2893	23	15	1	PINK MEDIUM DUSTY	H&M	52-103	\N	t	\N	2026-01-05 07:25:13.160148+00	\N
2894	23	15	1	PINK MEDIUM DUSTY	H&M	52-102	\N	t	\N	2026-01-05 07:25:13.170151+00	\N
2895	23	15	3	PINK DUSTY LIGHT	H&M	52-101	\N	t	\N	2026-01-05 07:25:13.177323+00	\N
2896	23	15	5	PINK MEDIUM	H&M	51-306	\N	t	\N	2026-01-05 07:25:13.188014+00	\N
2897	23	15	6	PINK LIGHT	H&M	51-305	\N	t	\N	2026-01-05 07:25:13.194463+00	\N
2898	23	15	6	PINK LIGHT	H&M	51-304	\N	t	\N	2026-01-05 07:25:13.203912+00	\N
2899	23	15	5	PINK MEDIUM	H&M	51-303	\N	t	\N	2026-01-05 07:25:13.210404+00	\N
2900	23	15	6	PINK LIGHT	H&M	51-220	\N	t	\N	2026-01-05 07:25:13.219978+00	\N
2901	23	15	5	PINK MEDIUM	H&M	51-219	\N	t	\N	2026-01-05 07:25:13.226529+00	\N
2902	23	15	3	PINK DUSTY LIGHT	H&M	51-218	\N	t	\N	2026-01-05 07:25:13.235785+00	\N
2903	23	15	6	PINK LIGHT	H&M	51-217	\N	t	\N	2026-01-05 07:25:13.24253+00	\N
2904	23	15	3	PINK DUSTY LIGHT	H&M	51-216	\N	t	\N	2026-01-05 07:25:13.251676+00	\N
2905	23	15	6	PINK LIGHT	H&M	51-215	\N	t	\N	2026-01-05 07:25:13.258157+00	\N
2906	23	15	3	PINK DUSTY LIGHT	H&M	51-214	\N	t	\N	2026-01-05 07:25:13.266029+00	\N
2907	23	15	3	PINK DUSTY LIGHT	H&M	51-212	\N	t	\N	2026-01-05 07:25:13.27306+00	\N
2908	23	15	6	PINK LIGHT	H&M	51-211	\N	t	\N	2026-01-05 07:25:13.280094+00	\N
2909	23	15	6	PINK LIGHT	H&M	51-210	\N	t	\N	2026-01-05 07:25:13.288416+00	\N
2910	23	15	6	PINK LIGHT	H&M	51-209	\N	t	\N	2026-01-05 07:25:13.294507+00	\N
2911	23	15	6	PINK LIGHT	H&M	51-208	\N	t	\N	2026-01-05 07:25:13.303822+00	\N
2912	23	15	6	PINK LIGHT	H&M	51-207	\N	t	\N	2026-01-05 07:25:13.310338+00	\N
2913	23	15	3	PINK DUSTY LIGHT	H&M	51-206	\N	t	\N	2026-01-05 07:25:13.320003+00	\N
2914	23	15	3	PINK DUSTY LIGHT	H&M	51-205	\N	t	\N	2026-01-05 07:25:13.326711+00	\N
2915	23	15	6	PINK LIGHT	H&M	51-204	\N	t	\N	2026-01-05 07:25:13.335795+00	\N
2916	23	15	6	PINK LIGHT	H&M	51-203	\N	t	\N	2026-01-05 07:25:13.342208+00	\N
2917	23	15	6	PINK LIGHT	H&M	51-202	\N	t	\N	2026-01-05 07:25:13.351656+00	\N
2918	23	15	6	PINK LIGHT	H&M	51-201	\N	t	\N	2026-01-05 07:25:13.358611+00	\N
2919	23	15	3	PINK DUSTY LIGHT	H&M	51-137	\N	t	\N	2026-01-05 07:25:13.366936+00	\N
2920	23	15	3	PINK DUSTY LIGHT	H&M	51-136	\N	t	\N	2026-01-05 07:25:13.37323+00	\N
2921	23	15	3	PINK DUSTY LIGHT	H&M	51-135	\N	t	\N	2026-01-05 07:25:13.380057+00	\N
2922	23	15	3	PINK DUSTY LIGHT	H&M	51-134	\N	t	\N	2026-01-05 07:25:13.388786+00	\N
2923	23	15	3	PINK DUSTY LIGHT	H&M	51-133	\N	t	\N	2026-01-05 07:25:13.395647+00	\N
2924	23	15	3	PINK DUSTY LIGHT	H&M	51-132	\N	t	\N	2026-01-05 07:25:13.405504+00	\N
2925	23	15	3	PINK DUSTY LIGHT	H&M	51-131	\N	t	\N	2026-01-05 07:25:13.411775+00	\N
2926	23	15	3	PINK DUSTY LIGHT	H&M	51-130	\N	t	\N	2026-01-05 07:25:13.421507+00	\N
2927	23	15	3	PINK DUSTY LIGHT	H&M	51-129	\N	t	\N	2026-01-05 07:25:13.427998+00	\N
2928	23	15	3	PINK DUSTY LIGHT	H&M	51-128	\N	t	\N	2026-01-05 07:25:13.438996+00	\N
2929	23	15	3	PINK DUSTY LIGHT	H&M	51-127	\N	t	\N	2026-01-05 07:25:13.445231+00	\N
2930	23	15	3	PINK DUSTY LIGHT	H&M	51-126	\N	t	\N	2026-01-05 07:25:13.456449+00	\N
2931	23	15	3	PINK DUSTY LIGHT	H&M	51-125	\N	t	\N	2026-01-05 07:25:13.464044+00	\N
2932	23	15	3	PINK DUSTY LIGHT	H&M	51-123	\N	t	\N	2026-01-05 07:25:13.473335+00	\N
2933	23	15	3	PINK DUSTY LIGHT	H&M	51-122	\N	t	\N	2026-01-05 07:25:13.48164+00	\N
2934	23	15	3	PINK DUSTY LIGHT	H&M	51-121	\N	t	\N	2026-01-05 07:25:13.489247+00	\N
2935	23	15	3	PINK DUSTY LIGHT	H&M	51-120	\N	t	\N	2026-01-05 07:25:13.495868+00	\N
2936	23	15	3	PINK DUSTY LIGHT	H&M	51-119	\N	t	\N	2026-01-05 07:25:13.505147+00	\N
2937	23	15	3	PINK DUSTY LIGHT	H&M	51-118	\N	t	\N	2026-01-05 07:25:13.511378+00	\N
2938	23	15	3	PINK DUSTY LIGHT	H&M	51-117	\N	t	\N	2026-01-05 07:25:13.52225+00	\N
2939	23	15	3	PINK DUSTY LIGHT	H&M	51-116	\N	t	\N	2026-01-05 07:25:13.528487+00	\N
2940	23	15	3	PINK DUSTY LIGHT	H&M	51-114	\N	t	\N	2026-01-05 07:25:13.538761+00	\N
2941	23	15	3	PINK DUSTY LIGHT	H&M	51-113	\N	t	\N	2026-01-05 07:25:13.54562+00	\N
2942	23	15	3	PINK DUSTY LIGHT	H&M	51-112	\N	t	\N	2026-01-05 07:25:13.555033+00	\N
2943	23	15	3	PINK DUSTY LIGHT	H&M	51-111	\N	t	\N	2026-01-05 07:25:13.561334+00	\N
2944	23	15	3	PINK DUSTY LIGHT	H&M	51-110	\N	t	\N	2026-01-05 07:25:13.570748+00	\N
2945	23	15	6	PINK LIGHT	H&M	51-109	\N	t	\N	2026-01-05 07:25:13.577103+00	\N
2946	23	15	3	PINK DUSTY LIGHT	H&M	51-108	\N	t	\N	2026-01-05 07:25:13.586595+00	\N
2947	23	15	3	PINK DUSTY LIGHT	H&M	51-107	\N	t	\N	2026-01-05 07:25:13.5931+00	\N
2948	23	15	3	PINK DUSTY LIGHT	H&M	51-106	\N	t	\N	2026-01-05 07:25:13.60293+00	\N
2949	23	15	3	PINK DUSTY LIGHT	H&M	51-105	\N	t	\N	2026-01-05 07:25:13.60929+00	\N
2950	23	15	3	PINK DUSTY LIGHT	H&M	51-104	\N	t	\N	2026-01-05 07:25:13.618348+00	\N
2951	23	15	5	PINK MEDIUM	H&M	51-103	\N	t	\N	2026-01-05 07:25:13.624856+00	\N
2952	23	15	3	PINK DUSTY LIGHT	H&M	51-102	\N	t	\N	2026-01-05 07:25:13.634144+00	\N
2953	23	15	3	PINK DUSTY LIGHT	H&M	51-101	\N	t	\N	2026-01-05 07:25:13.641001+00	\N
2954	23	15	4	PINK BRIGHT	H&M	50-307	\N	t	\N	2026-01-05 07:25:13.649098+00	\N
2955	23	15	4	PINK BRIGHT	H&M	50-306	\N	t	\N	2026-01-05 07:25:13.65596+00	\N
2956	23	15	4	PINK BRIGHT	H&M	50-305	\N	t	\N	2026-01-05 07:25:13.662546+00	\N
2957	23	15	4	PINK BRIGHT	H&M	50-304	\N	t	\N	2026-01-05 07:25:13.671722+00	\N
2958	23	15	4	PINK BRIGHT	H&M	50-303	\N	t	\N	2026-01-05 07:25:13.678164+00	\N
2959	23	15	4	PINK BRIGHT	H&M	50-302	\N	t	\N	2026-01-05 07:25:13.68784+00	\N
2960	23	15	4	PINK BRIGHT	H&M	50-301	\N	t	\N	2026-01-05 07:25:13.694646+00	\N
2961	23	15	4	PINK BRIGHT	H&M	50-127	\N	t	\N	2026-01-05 07:25:13.704957+00	\N
2962	23	15	4	PINK BRIGHT	H&M	50-126	\N	t	\N	2026-01-05 07:25:13.7119+00	\N
2963	23	15	6	PINK LIGHT	H&M	50-125	\N	t	\N	2026-01-05 07:25:13.721143+00	\N
2964	23	15	4	PINK BRIGHT	H&M	50-124	\N	t	\N	2026-01-05 07:25:13.72685+00	\N
2965	23	15	4	PINK BRIGHT	H&M	50-123	\N	t	\N	2026-01-05 07:25:13.736284+00	\N
2966	23	15	4	PINK BRIGHT	H&M	50-122	\N	t	\N	2026-01-05 07:25:13.742148+00	\N
2967	23	15	4	PINK BRIGHT	H&M	50-120	\N	t	\N	2026-01-05 07:25:13.750389+00	\N
2968	23	15	4	PINK BRIGHT	H&M	50-119	\N	t	\N	2026-01-05 07:25:13.757225+00	\N
2969	23	15	4	PINK BRIGHT	H&M	50-118	\N	t	\N	2026-01-05 07:25:13.765631+00	\N
2970	23	15	4	PINK BRIGHT	H&M	50-116	\N	t	\N	2026-01-05 07:25:13.772892+00	\N
2971	23	15	4	PINK BRIGHT	H&M	50-115	\N	t	\N	2026-01-05 07:25:13.781776+00	\N
2972	23	15	4	PINK BRIGHT	H&M	50-114	\N	t	\N	2026-01-05 07:25:13.789205+00	\N
2973	23	15	4	PINK BRIGHT	H&M	50-113	\N	t	\N	2026-01-05 07:25:13.795613+00	\N
2974	23	15	4	PINK BRIGHT	H&M	50-112	\N	t	\N	2026-01-05 07:25:13.804555+00	\N
2975	23	15	4	PINK BRIGHT	H&M	50-111	\N	t	\N	2026-01-05 07:25:13.810188+00	\N
2976	23	15	4	PINK BRIGHT	H&M	50-110	\N	t	\N	2026-01-05 07:25:13.81883+00	\N
2977	23	15	4	PINK BRIGHT	H&M	50-109	\N	t	\N	2026-01-05 07:25:13.824902+00	\N
2978	23	15	4	PINK BRIGHT	H&M	50-108	\N	t	\N	2026-01-05 07:25:13.832382+00	\N
2979	23	15	4	PINK BRIGHT	H&M	50-107	\N	t	\N	2026-01-05 07:25:13.838987+00	\N
2980	23	15	4	PINK BRIGHT	H&M	50-106	\N	t	\N	2026-01-05 07:25:13.844851+00	\N
2981	23	15	4	PINK BRIGHT	H&M	50-105	\N	t	\N	2026-01-05 07:25:13.853824+00	\N
2982	23	15	4	PINK BRIGHT	H&M	50-104	\N	t	\N	2026-01-05 07:25:13.859587+00	\N
2983	23	15	4	PINK BRIGHT	H&M	50-103	\N	t	\N	2026-01-05 07:25:13.86826+00	\N
2984	23	15	6	PINK LIGHT	H&M	50-102	\N	t	\N	2026-01-05 07:25:13.875042+00	\N
2985	23	15	4	PINK BRIGHT	H&M	50-101	\N	t	\N	2026-01-05 07:25:13.884496+00	\N
2986	23	15	2	PINK DARK	H&M	49-201	\N	t	\N	2026-01-05 07:25:13.891733+00	\N
2987	23	15	2	PINK DARK	H&M	49-105	\N	t	\N	2026-01-05 07:25:13.901425+00	\N
2988	23	15	2	PINK DARK	H&M	49-103	\N	t	\N	2026-01-05 07:25:13.908201+00	\N
2989	23	15	2	PINK DARK	H&M	48-206	\N	t	\N	2026-01-05 07:25:13.91787+00	\N
2990	23	15	5	PINK MEDIUM	H&M	48-205	\N	t	\N	2026-01-05 07:25:13.924866+00	\N
2991	23	15	2	PINK DARK	H&M	48-202	\N	t	\N	2026-01-05 07:25:13.932446+00	\N
2992	23	15	5	PINK MEDIUM	H&M	47-201	\N	t	\N	2026-01-05 07:25:13.939188+00	\N
2993	23	15	2	PINK DARK	H&M	46-203	\N	t	\N	2026-01-05 07:25:13.945176+00	\N
2994	23	15	1	PINK MEDIUM DUSTY	H&M	45-101	\N	t	\N	2026-01-05 07:25:13.954246+00	\N
2995	23	15	5	PINK MEDIUM	H&M	44-308	\N	t	\N	2026-01-05 07:25:13.960338+00	\N
2996	23	15	5	PINK MEDIUM	H&M	44-307	\N	t	\N	2026-01-05 07:25:13.969952+00	\N
2997	23	15	3	PINK DUSTY LIGHT	H&M	37-126	\N	t	\N	2026-01-05 07:25:13.976551+00	\N
2998	23	15	3	PINK DUSTY LIGHT	H&M	37-125	\N	t	\N	2026-01-05 07:25:13.986202+00	\N
2999	3	3	2	RED DARK	H&M	63-112	\N	t	\N	2026-01-05 07:25:13.992957+00	\N
3000	3	3	2	RED DARK	H&M	59-105	\N	t	\N	2026-01-05 07:25:14.003557+00	\N
3001	3	3	2	RED DARK	H&M	59-102	\N	t	\N	2026-01-05 07:25:14.010084+00	\N
3002	3	3	2	RED DARK	H&M	56-217	\N	t	\N	2026-01-05 07:25:14.019584+00	\N
3003	3	3	2	RED DARK	H&M	56-209	\N	t	\N	2026-01-05 07:25:14.026025+00	\N
3004	3	3	2	RED DARK	H&M	49-302	\N	t	\N	2026-01-05 07:25:14.035086+00	\N
3005	3	3	2	RED DARK	H&M	49-301	\N	t	\N	2026-01-05 07:25:14.043336+00	\N
3006	3	3	2	RED DARK	H&M	49-219	\N	t	\N	2026-01-05 07:25:14.053478+00	\N
3007	3	3	2	RED DARK	H&M	49-218	\N	t	\N	2026-01-05 07:25:14.059939+00	\N
3008	3	3	2	RED DARK	H&M	49-217	\N	t	\N	2026-01-05 07:25:14.069284+00	\N
3009	3	3	2	RED DARK	H&M	49-216	\N	t	\N	2026-01-05 07:25:14.075847+00	\N
3010	3	3	2	RED DARK	H&M	49-215	\N	t	\N	2026-01-05 07:25:14.085497+00	\N
3011	3	3	2	RED DARK	H&M	49-214	\N	t	\N	2026-01-05 07:25:14.092086+00	\N
3012	3	3	2	RED DARK	H&M	49-213	\N	t	\N	2026-01-05 07:25:14.101173+00	\N
3013	3	3	2	RED DARK	H&M	49-212	\N	t	\N	2026-01-05 07:25:14.107491+00	\N
3014	3	3	2	RED DARK	H&M	49-211	\N	t	\N	2026-01-05 07:25:14.115519+00	\N
3015	3	3	2	RED DARK	H&M	49-210	\N	t	\N	2026-01-05 07:25:14.122559+00	\N
3016	3	3	2	RED DARK	H&M	49-209	\N	t	\N	2026-01-05 07:25:14.12827+00	\N
3017	3	3	2	RED DARK	H&M	49-208	\N	t	\N	2026-01-05 07:25:14.138743+00	\N
3018	3	3	2	RED DARK	H&M	49-207	\N	t	\N	2026-01-05 07:25:14.145509+00	\N
3019	3	3	2	RED DARK	H&M	49-206	\N	t	\N	2026-01-05 07:25:14.154296+00	\N
3020	3	3	2	RED DARK	H&M	49-205	\N	t	\N	2026-01-05 07:25:14.160223+00	\N
3021	3	3	2	RED DARK	H&M	49-204	\N	t	\N	2026-01-05 07:25:14.169065+00	\N
3022	3	3	2	RED DARK	H&M	49-203	\N	t	\N	2026-01-05 07:25:14.174877+00	\N
3023	3	3	2	RED DARK	H&M	49-202	\N	t	\N	2026-01-05 07:25:14.18396+00	\N
3024	3	3	2	RED DARK	H&M	49-111	\N	t	\N	2026-01-05 07:25:14.19071+00	\N
3025	3	3	2	RED DARK	H&M	49-109	\N	t	\N	2026-01-05 07:25:14.199467+00	\N
3026	3	3	2	RED DARK	H&M	49-108	\N	t	\N	2026-01-05 07:25:14.20586+00	\N
3027	3	3	2	RED DARK	H&M	49-107	\N	t	\N	2026-01-05 07:25:14.211522+00	\N
3028	3	3	2	RED DARK	H&M	49-106	\N	t	\N	2026-01-05 07:25:14.223123+00	\N
3029	3	3	2	RED DARK	H&M	49-104	\N	t	\N	2026-01-05 07:25:14.231993+00	\N
3030	3	3	2	RED DARK	H&M	49-102	\N	t	\N	2026-01-05 07:25:14.240769+00	\N
3031	3	3	2	RED DARK	H&M	49-101	\N	t	\N	2026-01-05 07:25:14.251091+00	\N
3032	3	3	4	RED BRIGHT	H&M	48-306	\N	t	\N	2026-01-05 07:25:14.257703+00	\N
3033	3	3	4	RED BRIGHT	H&M	48-304	\N	t	\N	2026-01-05 07:25:14.266244+00	\N
3034	3	3	4	RED BRIGHT	H&M	48-303	\N	t	\N	2026-01-05 07:25:14.273562+00	\N
3035	3	3	4	RED BRIGHT	H&M	48-302	\N	t	\N	2026-01-05 07:25:14.282059+00	\N
3036	3	3	5	RED MEDIUM	H&M	48-301	\N	t	\N	2026-01-05 07:25:14.289114+00	\N
3037	3	3	5	RED MEDIUM	H&M	48-207	\N	t	\N	2026-01-05 07:25:14.297668+00	\N
3038	3	3	1	RED MEDIUM DUSTY	H&M	48-204	\N	t	\N	2026-01-05 07:25:14.305934+00	\N
3039	3	3	1	RED MEDIUM DUSTY	H&M	48-203	\N	t	\N	2026-01-05 07:25:14.314364+00	\N
3040	3	3	1	RED MEDIUM DUSTY	H&M	48-201	\N	t	\N	2026-01-05 07:25:14.322386+00	\N
3041	3	3	5	RED MEDIUM	H&M	46-316	\N	t	\N	2026-01-05 07:25:14.33229+00	\N
3042	3	3	5	RED MEDIUM	H&M	46-315	\N	t	\N	2026-01-05 07:25:14.340945+00	\N
3043	3	3	2	RED DARK	H&M	46-314	\N	t	\N	2026-01-05 07:25:14.348415+00	\N
3044	3	3	2	RED DARK	H&M	46-313	\N	t	\N	2026-01-05 07:25:14.355817+00	\N
3045	3	3	5	RED MEDIUM	H&M	46-312	\N	t	\N	2026-01-05 07:25:14.363689+00	\N
3046	3	3	2	RED DARK	H&M	46-311	\N	t	\N	2026-01-05 07:25:14.37213+00	\N
3047	3	3	5	RED MEDIUM	H&M	46-310	\N	t	\N	2026-01-05 07:25:14.380922+00	\N
3048	3	3	5	RED MEDIUM	H&M	46-309	\N	t	\N	2026-01-05 07:25:14.388892+00	\N
3049	3	3	5	RED MEDIUM	H&M	46-308	\N	t	\N	2026-01-05 07:25:14.397969+00	\N
3050	3	3	5	RED MEDIUM	H&M	46-307	\N	t	\N	2026-01-05 07:25:14.406637+00	\N
3051	3	3	5	RED MEDIUM	H&M	46-306	\N	t	\N	2026-01-05 07:25:14.415149+00	\N
3052	3	3	5	RED MEDIUM	H&M	46-305	\N	t	\N	2026-01-05 07:25:14.422875+00	\N
3053	3	3	5	RED MEDIUM	H&M	46-304	\N	t	\N	2026-01-05 07:25:14.431748+00	\N
3054	3	3	2	RED DARK	H&M	46-303	\N	t	\N	2026-01-05 07:25:14.439696+00	\N
3055	3	3	5	RED MEDIUM	H&M	46-302	\N	t	\N	2026-01-05 07:25:14.448364+00	\N
3056	3	3	2	RED DARK	H&M	46-301	\N	t	\N	2026-01-05 07:25:14.45602+00	\N
3057	3	3	2	RED DARK	H&M	46-220	\N	t	\N	2026-01-05 07:25:14.464955+00	\N
3058	3	3	2	RED DARK	H&M	46-219	\N	t	\N	2026-01-05 07:25:14.472691+00	\N
3059	3	3	2	RED DARK	H&M	46-218	\N	t	\N	2026-01-05 07:25:14.481162+00	\N
3060	3	3	2	RED DARK	H&M	46-217	\N	t	\N	2026-01-05 07:25:14.488964+00	\N
3061	3	3	2	RED DARK	H&M	46-216	\N	t	\N	2026-01-05 07:25:14.497764+00	\N
3062	3	3	2	RED DARK	H&M	46-215	\N	t	\N	2026-01-05 07:25:14.505341+00	\N
3063	3	3	2	RED DARK	H&M	46-214	\N	t	\N	2026-01-05 07:25:14.513648+00	\N
3064	3	3	2	RED DARK	H&M	46-213	\N	t	\N	2026-01-05 07:25:14.521581+00	\N
3065	3	3	2	RED DARK	H&M	46-212	\N	t	\N	2026-01-05 07:25:14.52785+00	\N
3066	3	3	2	RED DARK	H&M	46-211	\N	t	\N	2026-01-05 07:25:14.537705+00	\N
3067	3	3	2	RED DARK	H&M	46-210	\N	t	\N	2026-01-05 07:25:14.544573+00	\N
3068	3	3	2	RED DARK	H&M	46-209	\N	t	\N	2026-01-05 07:25:14.554283+00	\N
3069	3	3	2	RED DARK	H&M	46-208	\N	t	\N	2026-01-05 07:25:14.560973+00	\N
3070	3	3	2	RED DARK	H&M	46-207	\N	t	\N	2026-01-05 07:25:14.571737+00	\N
3071	3	3	2	RED DARK	H&M	46-206	\N	t	\N	2026-01-05 07:25:14.579348+00	\N
3072	3	3	1	RED MEDIUM DUSTY	H&M	46-205	\N	t	\N	2026-01-05 07:25:14.589278+00	\N
3073	3	3	2	RED DARK	H&M	46-204	\N	t	\N	2026-01-05 07:25:14.598045+00	\N
3074	3	3	2	RED DARK	H&M	46-202	\N	t	\N	2026-01-05 07:25:14.605581+00	\N
3075	3	3	2	RED DARK	H&M	46-201	\N	t	\N	2026-01-05 07:25:14.614877+00	\N
3076	3	3	2	RED DARK	H&M	46-102	\N	t	\N	2026-01-05 07:25:14.622079+00	\N
3077	3	3	2	RED DARK	H&M	46-101	\N	t	\N	2026-01-05 07:25:14.629489+00	\N
3078	3	3	4	RED BRIGHT	H&M	45-329	\N	t	\N	2026-01-05 07:25:14.638106+00	\N
3079	3	3	4	RED BRIGHT	H&M	45-328	\N	t	\N	2026-01-05 07:25:14.644709+00	\N
3080	3	3	4	RED BRIGHT	H&M	45-327	\N	t	\N	2026-01-05 07:25:14.655442+00	\N
3081	3	3	4	RED BRIGHT	H&M	45-326	\N	t	\N	2026-01-05 07:25:14.663986+00	\N
3082	3	3	4	RED BRIGHT	H&M	45-325	\N	t	\N	2026-01-05 07:25:14.671795+00	\N
3083	3	3	4	RED BRIGHT	H&M	45-324	\N	t	\N	2026-01-05 07:25:14.680279+00	\N
3084	3	3	4	RED BRIGHT	H&M	45-323	\N	t	\N	2026-01-05 07:25:14.68835+00	\N
3085	3	3	4	RED BRIGHT	H&M	45-322	\N	t	\N	2026-01-05 07:25:14.695661+00	\N
3086	3	3	4	RED BRIGHT	H&M	45-321	\N	t	\N	2026-01-05 07:25:14.704188+00	\N
3087	3	3	4	RED BRIGHT	H&M	45-320	\N	t	\N	2026-01-05 07:25:14.710464+00	\N
3088	3	3	5	RED MEDIUM	H&M	45-319	\N	t	\N	2026-01-05 07:25:14.719982+00	\N
3089	3	3	5	RED MEDIUM	H&M	45-318	\N	t	\N	2026-01-05 07:25:14.72699+00	\N
3090	3	3	4	RED BRIGHT	H&M	45-317	\N	t	\N	2026-01-05 07:25:14.736547+00	\N
3091	3	3	5	RED MEDIUM	H&M	45-316	\N	t	\N	2026-01-05 07:25:14.74356+00	\N
3092	3	3	4	RED BRIGHT	H&M	45-315	\N	t	\N	2026-01-05 07:25:14.754108+00	\N
3093	3	3	4	RED BRIGHT	H&M	45-314	\N	t	\N	2026-01-05 07:25:14.762775+00	\N
3094	3	3	5	RED MEDIUM	H&M	45-313	\N	t	\N	2026-01-05 07:25:14.771704+00	\N
3095	3	3	5	RED MEDIUM	H&M	45-312	\N	t	\N	2026-01-05 07:25:14.780015+00	\N
3096	3	3	4	RED BRIGHT	H&M	45-311	\N	t	\N	2026-01-05 07:25:14.788327+00	\N
3097	3	3	5	RED MEDIUM	H&M	45-310	\N	t	\N	2026-01-05 07:25:14.797429+00	\N
3098	3	3	5	RED MEDIUM	H&M	45-309	\N	t	\N	2026-01-05 07:25:14.805537+00	\N
3099	3	3	5	RED MEDIUM	H&M	45-308	\N	t	\N	2026-01-05 07:25:14.814707+00	\N
3100	3	3	5	RED MEDIUM	H&M	45-307	\N	t	\N	2026-01-05 07:25:14.822337+00	\N
3101	3	3	5	RED MEDIUM	H&M	45-306	\N	t	\N	2026-01-05 07:25:14.831278+00	\N
3102	3	3	5	RED MEDIUM	H&M	45-305	\N	t	\N	2026-01-05 07:25:14.838574+00	\N
3103	3	3	4	RED BRIGHT	H&M	45-304	\N	t	\N	2026-01-05 07:25:14.846924+00	\N
3104	3	3	5	RED MEDIUM	H&M	45-303	\N	t	\N	2026-01-05 07:25:14.85452+00	\N
3105	3	3	5	RED MEDIUM	H&M	45-302	\N	t	\N	2026-01-05 07:25:14.861144+00	\N
3106	3	3	5	RED MEDIUM	H&M	45-301	\N	t	\N	2026-01-05 07:25:14.871025+00	\N
3107	3	3	5	RED MEDIUM	H&M	45-207	\N	t	\N	2026-01-05 07:25:14.878135+00	\N
3108	3	3	5	RED MEDIUM	H&M	45-206	\N	t	\N	2026-01-05 07:25:14.888119+00	\N
3109	3	3	5	RED MEDIUM	H&M	45-205	\N	t	\N	2026-01-05 07:25:14.89628+00	\N
3110	3	3	1	RED MEDIUM DUSTY	H&M	45-204	\N	t	\N	2026-01-05 07:25:14.905208+00	\N
3111	3	3	5	RED MEDIUM	H&M	45-203	\N	t	\N	2026-01-05 07:25:14.915761+00	\N
3112	3	3	5	RED MEDIUM	H&M	45-202	\N	t	\N	2026-01-05 07:25:14.926237+00	\N
3113	3	3	1	RED MEDIUM DUSTY	H&M	45-201	\N	t	\N	2026-01-05 07:25:14.937735+00	\N
3114	3	3	4	RED BRIGHT	H&M	44-309	\N	t	\N	2026-01-05 07:25:14.946401+00	\N
3115	3	3	5	RED MEDIUM	H&M	44-306	\N	t	\N	2026-01-05 07:25:14.956902+00	\N
3116	3	3	5	RED MEDIUM	H&M	44-305	\N	t	\N	2026-01-05 07:25:14.965533+00	\N
3117	3	3	5	RED MEDIUM	H&M	44-304	\N	t	\N	2026-01-05 07:25:14.973328+00	\N
3118	3	3	5	RED MEDIUM	H&M	44-303	\N	t	\N	2026-01-05 07:25:14.984309+00	\N
3119	3	3	5	RED MEDIUM	H&M	44-302	\N	t	\N	2026-01-05 07:25:14.99101+00	\N
3120	3	3	5	RED MEDIUM	H&M	44-301	\N	t	\N	2026-01-05 07:25:14.998339+00	\N
3121	3	3	5	RED MEDIUM	H&M	44-205	\N	t	\N	2026-01-05 07:25:15.005259+00	\N
3122	3	3	1	RED MEDIUM DUSTY	H&M	44-204	\N	t	\N	2026-01-05 07:25:15.011052+00	\N
3123	3	3	5	RED MEDIUM	H&M	44-203	\N	t	\N	2026-01-05 07:25:15.020411+00	\N
3124	3	3	2	RED DARK	H&M	43-308	\N	t	\N	2026-01-05 07:25:15.02661+00	\N
3125	3	3	2	RED DARK	H&M	43-307	\N	t	\N	2026-01-05 07:25:15.036802+00	\N
3126	3	3	1	RED MEDIUM DUSTY	H&M	43-305	\N	t	\N	2026-01-05 07:25:15.044078+00	\N
3127	3	3	2	RED DARK	H&M	43-215	\N	t	\N	2026-01-05 07:25:15.054922+00	\N
3128	3	3	2	RED DARK	H&M	43-214	\N	t	\N	2026-01-05 07:25:15.062971+00	\N
3129	3	3	2	RED DARK	H&M	43-213	\N	t	\N	2026-01-05 07:25:15.071217+00	\N
3130	3	3	2	RED DARK	H&M	43-212	\N	t	\N	2026-01-05 07:25:15.077832+00	\N
3131	3	3	2	RED DARK	H&M	43-208	\N	t	\N	2026-01-05 07:25:15.087575+00	\N
3132	3	3	2	RED DARK	H&M	43-207	\N	t	\N	2026-01-05 07:25:15.095017+00	\N
3133	3	3	2	RED DARK	H&M	43-206	\N	t	\N	2026-01-05 07:25:15.105192+00	\N
3134	3	3	2	RED DARK	H&M	43-205	\N	t	\N	2026-01-05 07:25:15.114392+00	\N
3135	3	3	1	RED MEDIUM DUSTY	H&M	43-203	\N	t	\N	2026-01-05 07:25:15.121998+00	\N
3136	3	3	2	RED DARK	H&M	43-202	\N	t	\N	2026-01-05 07:25:15.131088+00	\N
3137	3	3	2	RED DARK	H&M	43-201	\N	t	\N	2026-01-05 07:25:15.139181+00	\N
3138	3	3	2	RED DARK	H&M	43-103	\N	t	\N	2026-01-05 07:25:15.148053+00	\N
3139	3	3	2	RED DARK	H&M	43-101	\N	t	\N	2026-01-05 07:25:15.155198+00	\N
3140	3	3	4	RED BRIGHT	H&M	42-323	\N	t	\N	2026-01-05 07:25:15.16345+00	\N
3141	3	3	5	RED MEDIUM	H&M	42-322	\N	t	\N	2026-01-05 07:25:15.171489+00	\N
3142	3	3	5	RED MEDIUM	H&M	42-321	\N	t	\N	2026-01-05 07:25:15.180051+00	\N
3143	3	3	5	RED MEDIUM	H&M	42-320	\N	t	\N	2026-01-05 07:25:15.189793+00	\N
3144	3	3	5	RED MEDIUM	H&M	42-319	\N	t	\N	2026-01-05 07:25:15.198161+00	\N
3145	3	3	4	RED BRIGHT	H&M	42-318	\N	t	\N	2026-01-05 07:25:15.205781+00	\N
3146	3	3	4	RED BRIGHT	H&M	42-317	\N	t	\N	2026-01-05 07:25:15.214562+00	\N
3147	3	3	4	RED BRIGHT	H&M	42-316	\N	t	\N	2026-01-05 07:25:15.222174+00	\N
3148	3	3	4	RED BRIGHT	H&M	42-315	\N	t	\N	2026-01-05 07:25:15.230935+00	\N
3149	3	3	4	RED BRIGHT	H&M	42-314	\N	t	\N	2026-01-05 07:25:15.238471+00	\N
3150	3	3	4	RED BRIGHT	H&M	42-313	\N	t	\N	2026-01-05 07:25:15.247481+00	\N
3151	3	3	5	RED MEDIUM	H&M	42-312	\N	t	\N	2026-01-05 07:25:15.257081+00	\N
3152	3	3	5	RED MEDIUM	H&M	42-311	\N	t	\N	2026-01-05 07:25:15.271692+00	\N
3153	3	3	5	RED MEDIUM	H&M	42-310	\N	t	\N	2026-01-05 07:25:15.284189+00	\N
3154	3	3	4	RED BRIGHT	H&M	42-309	\N	t	\N	2026-01-05 07:25:15.29427+00	\N
3155	3	3	4	RED BRIGHT	H&M	42-308	\N	t	\N	2026-01-05 07:25:15.306878+00	\N
3156	3	3	4	RED BRIGHT	H&M	42-307	\N	t	\N	2026-01-05 07:25:15.317905+00	\N
3157	3	3	4	RED BRIGHT	H&M	42-306	\N	t	\N	2026-01-05 07:25:15.325193+00	\N
3158	3	3	4	RED BRIGHT	H&M	42-305	\N	t	\N	2026-01-05 07:25:15.33851+00	\N
3159	3	3	5	RED MEDIUM	H&M	42-304	\N	t	\N	2026-01-05 07:25:15.351426+00	\N
3160	3	3	5	RED MEDIUM	H&M	42-303	\N	t	\N	2026-01-05 07:25:15.359094+00	\N
3161	3	3	5	RED MEDIUM	H&M	42-302	\N	t	\N	2026-01-05 07:25:15.371241+00	\N
3162	3	3	4	RED BRIGHT	H&M	42-301	\N	t	\N	2026-01-05 07:25:15.380434+00	\N
3163	3	3	1	RED MEDIUM DUSTY	H&M	42-205	\N	t	\N	2026-01-05 07:25:15.388543+00	\N
3164	3	3	1	RED MEDIUM DUSTY	H&M	42-204	\N	t	\N	2026-01-05 07:25:15.394064+00	\N
3165	3	3	1	RED MEDIUM DUSTY	H&M	42-202	\N	t	\N	2026-01-05 07:25:15.402803+00	\N
3166	3	3	5	RED MEDIUM	H&M	42-201	\N	t	\N	2026-01-05 07:25:15.408667+00	\N
3167	3	3	4	RED BRIGHT	H&M	41-302	\N	t	\N	2026-01-05 07:25:15.417968+00	\N
3168	3	3	4	RED BRIGHT	H&M	41-301	\N	t	\N	2026-01-05 07:25:15.424329+00	\N
3169	3	3	1	RED MEDIUM DUSTY	H&M	41-206	\N	t	\N	2026-01-05 07:25:15.433554+00	\N
3170	3	3	5	RED MEDIUM	H&M	41-205	\N	t	\N	2026-01-05 07:25:15.440591+00	\N
3171	3	3	5	RED MEDIUM	H&M	41-204	\N	t	\N	2026-01-05 07:25:15.449004+00	\N
3172	3	3	5	RED MEDIUM	H&M	41-203	\N	t	\N	2026-01-05 07:25:15.456884+00	\N
3173	3	3	5	RED MEDIUM	H&M	41-201	\N	t	\N	2026-01-05 07:25:15.46758+00	\N
3174	3	3	1	RED MEDIUM DUSTY	H&M	41-105	\N	t	\N	2026-01-05 07:25:15.475965+00	\N
3175	3	3	1	RED MEDIUM DUSTY	H&M	41-104	\N	t	\N	2026-01-05 07:25:15.486742+00	\N
3176	3	3	1	RED MEDIUM DUSTY	H&M	41-103	\N	t	\N	2026-01-05 07:25:15.494161+00	\N
3177	3	3	1	RED MEDIUM DUSTY	H&M	41-102	\N	t	\N	2026-01-05 07:25:15.504803+00	\N
3178	3	3	1	RED MEDIUM DUSTY	H&M	41-101	\N	t	\N	2026-01-05 07:25:15.512759+00	\N
3179	3	3	4	RED BRIGHT	H&M	40-110	\N	t	\N	2026-01-05 07:25:15.521507+00	\N
3180	3	3	4	RED BRIGHT	H&M	40-109	\N	t	\N	2026-01-05 07:25:15.53086+00	\N
3181	3	3	4	RED BRIGHT	H&M	40-108	\N	t	\N	2026-01-05 07:25:15.538634+00	\N
3182	3	3	4	RED BRIGHT	H&M	40-107	\N	t	\N	2026-01-05 07:25:15.547415+00	\N
3183	3	3	4	RED BRIGHT	H&M	40-106	\N	t	\N	2026-01-05 07:25:15.554898+00	\N
3184	3	3	4	RED BRIGHT	H&M	40-105	\N	t	\N	2026-01-05 07:25:15.562757+00	\N
3185	3	3	4	RED BRIGHT	H&M	40-104	\N	t	\N	2026-01-05 07:25:15.570712+00	\N
3186	3	3	4	RED BRIGHT	H&M	40-103	\N	t	\N	2026-01-05 07:25:15.57786+00	\N
3187	3	3	4	RED BRIGHT	H&M	40-102	\N	t	\N	2026-01-05 07:25:15.587732+00	\N
3188	3	3	4	RED BRIGHT	H&M	40-101	\N	t	\N	2026-01-05 07:25:15.594471+00	\N
3189	3	3	4	RED BRIGHT	H&M	39-319	\N	t	\N	2026-01-05 07:25:15.603894+00	\N
3190	3	3	5	RED MEDIUM	H&M	39-318	\N	t	\N	2026-01-05 07:25:15.610772+00	\N
3191	3	3	5	RED MEDIUM	H&M	39-315	\N	t	\N	2026-01-05 07:25:15.621129+00	\N
3192	3	3	4	RED BRIGHT	H&M	39-309	\N	t	\N	2026-01-05 07:25:15.630336+00	\N
3193	3	3	5	RED MEDIUM	H&M	39-306	\N	t	\N	2026-01-05 07:25:15.638108+00	\N
3194	3	3	1	RED MEDIUM DUSTY	H&M	39-220	\N	t	\N	2026-01-05 07:25:15.646668+00	\N
3195	3	3	2	RED DARK	H&M	39-215	\N	t	\N	2026-01-05 07:25:15.654578+00	\N
3196	3	3	1	RED MEDIUM DUSTY	H&M	39-207	\N	t	\N	2026-01-05 07:25:15.662747+00	\N
3197	3	3	1	RED MEDIUM DUSTY	H&M	39-202	\N	t	\N	2026-01-05 07:25:15.670978+00	\N
3198	3	3	1	RED MEDIUM DUSTY	H&M	39-103	\N	t	\N	2026-01-05 07:25:15.678315+00	\N
3199	3	3	1	RED MEDIUM DUSTY	H&M	39-101	\N	t	\N	2026-01-05 07:25:15.68764+00	\N
3200	3	3	1	RED MEDIUM DUSTY	H&M	38-103	\N	t	\N	2026-01-05 07:25:15.694865+00	\N
3201	3	3	4	RED BRIGHT	H&M	30-110	\N	t	\N	2026-01-05 07:25:15.704861+00	\N
3202	24	16	4	TURQUOISE BRIGHT	H&M	89-306	\N	t	\N	2026-01-05 07:25:15.713741+00	\N
3203	24	16	2	TURQUOISE DARK	H&M	89-218	\N	t	\N	2026-01-05 07:25:15.72456+00	\N
3204	24	16	2	TURQUOISE DARK	H&M	89-117	\N	t	\N	2026-01-05 07:25:15.734385+00	\N
3205	24	16	2	TURQUOISE DARK	H&M	89-114	\N	t	\N	2026-01-05 07:25:15.741107+00	\N
3206	24	16	2	TURQUOISE DARK	H&M	89-111	\N	t	\N	2026-01-05 07:25:15.749958+00	\N
3207	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	89-108	\N	t	\N	2026-01-05 07:25:15.756902+00	\N
3208	24	16	2	TURQUOISE DARK	H&M	89-105	\N	t	\N	2026-01-05 07:25:15.766349+00	\N
3209	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	89-104	\N	t	\N	2026-01-05 07:25:15.773753+00	\N
3210	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	89-103	\N	t	\N	2026-01-05 07:25:15.783739+00	\N
3211	24	16	2	TURQUOISE DARK	H&M	89-101	\N	t	\N	2026-01-05 07:25:15.790866+00	\N
3212	24	16	4	TURQUOISE BRIGHT	H&M	88-305	\N	t	\N	2026-01-05 07:25:15.801236+00	\N
3213	24	16	4	TURQUOISE BRIGHT	H&M	88-304	\N	t	\N	2026-01-05 07:25:15.808889+00	\N
3214	24	16	5	TURQUOISE MEDIUM	H&M	88-302	\N	t	\N	2026-01-05 07:25:15.818887+00	\N
3215	24	16	5	TURQUOISE MEDIUM	H&M	88-211	\N	t	\N	2026-01-05 07:25:15.825747+00	\N
3216	24	16	5	TURQUOISE MEDIUM	H&M	88-207	\N	t	\N	2026-01-05 07:25:15.835437+00	\N
3217	24	16	5	TURQUOISE MEDIUM	H&M	88-205	\N	t	\N	2026-01-05 07:25:15.846328+00	\N
3218	24	16	3	TURQUOISE DUSTY LIGHT	H&M	88-204	\N	t	\N	2026-01-05 07:25:15.855476+00	\N
3219	24	16	5	TURQUOISE MEDIUM	H&M	88-203	\N	t	\N	2026-01-05 07:25:15.863715+00	\N
3220	24	16	6	TURQUOISE LIGHT	H&M	88-202	\N	t	\N	2026-01-05 07:25:15.871041+00	\N
3221	24	16	6	TURQUOISE LIGHT	H&M	88-201	\N	t	\N	2026-01-05 07:25:15.880582+00	\N
3222	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	88-115	\N	t	\N	2026-01-05 07:25:15.889039+00	\N
3223	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	88-113	\N	t	\N	2026-01-05 07:25:15.897408+00	\N
3224	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	88-112	\N	t	\N	2026-01-05 07:25:15.905078+00	\N
3225	24	16	3	TURQUOISE DUSTY LIGHT	H&M	88-110	\N	t	\N	2026-01-05 07:25:15.913999+00	\N
3226	24	16	3	TURQUOISE DUSTY LIGHT	H&M	88-109	\N	t	\N	2026-01-05 07:25:15.921519+00	\N
3227	24	16	3	TURQUOISE DUSTY LIGHT	H&M	88-108	\N	t	\N	2026-01-05 07:25:15.930538+00	\N
3228	24	16	3	TURQUOISE DUSTY LIGHT	H&M	88-107	\N	t	\N	2026-01-05 07:25:15.938269+00	\N
3229	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	88-106	\N	t	\N	2026-01-05 07:25:15.947204+00	\N
3230	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	88-105	\N	t	\N	2026-01-05 07:25:15.95469+00	\N
3231	24	16	3	TURQUOISE DUSTY LIGHT	H&M	88-104	\N	t	\N	2026-01-05 07:25:15.963991+00	\N
3232	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	88-103	\N	t	\N	2026-01-05 07:25:15.972245+00	\N
3233	24	16	3	TURQUOISE DUSTY LIGHT	H&M	88-102	\N	t	\N	2026-01-05 07:25:15.981012+00	\N
3234	24	16	6	TURQUOISE LIGHT	H&M	87-303	\N	t	\N	2026-01-05 07:25:15.98917+00	\N
3235	24	16	6	TURQUOISE LIGHT	H&M	87-209	\N	t	\N	2026-01-05 07:25:15.997985+00	\N
3236	24	16	6	TURQUOISE LIGHT	H&M	87-208	\N	t	\N	2026-01-05 07:25:16.005463+00	\N
3237	24	16	6	TURQUOISE LIGHT	H&M	87-207	\N	t	\N	2026-01-05 07:25:16.014073+00	\N
3238	24	16	6	TURQUOISE LIGHT	H&M	87-206	\N	t	\N	2026-01-05 07:25:16.021713+00	\N
3239	24	16	6	TURQUOISE LIGHT	H&M	87-205	\N	t	\N	2026-01-05 07:25:16.030498+00	\N
3240	24	16	6	TURQUOISE LIGHT	H&M	87-204	\N	t	\N	2026-01-05 07:25:16.037711+00	\N
3241	24	16	6	TURQUOISE LIGHT	H&M	87-203	\N	t	\N	2026-01-05 07:25:16.044321+00	\N
3242	24	16	6	TURQUOISE LIGHT	H&M	87-201	\N	t	\N	2026-01-05 07:25:16.053553+00	\N
3243	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-127	\N	t	\N	2026-01-05 07:25:16.060513+00	\N
3244	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-126	\N	t	\N	2026-01-05 07:25:16.070242+00	\N
3245	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-125	\N	t	\N	2026-01-05 07:25:16.07729+00	\N
3246	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-121	\N	t	\N	2026-01-05 07:25:16.087089+00	\N
3247	24	16	6	TURQUOISE LIGHT	H&M	87-120	\N	t	\N	2026-01-05 07:25:16.09372+00	\N
3248	24	16	6	TURQUOISE LIGHT	H&M	87-119	\N	t	\N	2026-01-05 07:25:16.103071+00	\N
3249	24	16	6	TURQUOISE LIGHT	H&M	87-118	\N	t	\N	2026-01-05 07:25:16.109405+00	\N
3250	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-117	\N	t	\N	2026-01-05 07:25:16.118827+00	\N
3251	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-111	\N	t	\N	2026-01-05 07:25:16.125324+00	\N
3252	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-110	\N	t	\N	2026-01-05 07:25:16.135103+00	\N
3253	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-109	\N	t	\N	2026-01-05 07:25:16.142302+00	\N
3254	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-108	\N	t	\N	2026-01-05 07:25:16.152964+00	\N
3255	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-107	\N	t	\N	2026-01-05 07:25:16.160429+00	\N
3256	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-106	\N	t	\N	2026-01-05 07:25:16.170136+00	\N
3257	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-105	\N	t	\N	2026-01-05 07:25:16.177033+00	\N
3258	24	16	6	TURQUOISE LIGHT	H&M	87-104	\N	t	\N	2026-01-05 07:25:16.187238+00	\N
3259	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-103	\N	t	\N	2026-01-05 07:25:16.195536+00	\N
3260	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-102	\N	t	\N	2026-01-05 07:25:16.203795+00	\N
3261	24	16	3	TURQUOISE DUSTY LIGHT	H&M	87-101	\N	t	\N	2026-01-05 07:25:16.211196+00	\N
3262	24	16	2	TURQUOISE DARK	H&M	86-308	\N	t	\N	2026-01-05 07:25:16.220109+00	\N
3263	24	16	2	TURQUOISE DARK	H&M	86-307	\N	t	\N	2026-01-05 07:25:16.227632+00	\N
3264	24	16	5	TURQUOISE MEDIUM	H&M	86-306	\N	t	\N	2026-01-05 07:25:16.237442+00	\N
3265	24	16	5	TURQUOISE MEDIUM	H&M	86-305	\N	t	\N	2026-01-05 07:25:16.245649+00	\N
3266	24	16	4	TURQUOISE BRIGHT	H&M	86-304	\N	t	\N	2026-01-05 07:25:16.253404+00	\N
3267	24	16	4	TURQUOISE BRIGHT	H&M	86-303	\N	t	\N	2026-01-05 07:25:16.259993+00	\N
3268	24	16	4	TURQUOISE BRIGHT	H&M	86-302	\N	t	\N	2026-01-05 07:25:16.270145+00	\N
3269	24	16	5	TURQUOISE MEDIUM	H&M	86-301	\N	t	\N	2026-01-05 07:25:16.277236+00	\N
3270	24	16	5	TURQUOISE MEDIUM	H&M	86-215	\N	t	\N	2026-01-05 07:25:16.286913+00	\N
3271	24	16	5	TURQUOISE MEDIUM	H&M	86-214	\N	t	\N	2026-01-05 07:25:16.294004+00	\N
3272	24	16	2	TURQUOISE DARK	H&M	86-213	\N	t	\N	2026-01-05 07:25:16.303349+00	\N
3273	24	16	2	TURQUOISE DARK	H&M	86-212	\N	t	\N	2026-01-05 07:25:16.310332+00	\N
3274	24	16	5	TURQUOISE MEDIUM	H&M	86-209	\N	t	\N	2026-01-05 07:25:16.320413+00	\N
3275	24	16	5	TURQUOISE MEDIUM	H&M	86-208	\N	t	\N	2026-01-05 07:25:16.328341+00	\N
3276	24	16	5	TURQUOISE MEDIUM	H&M	86-207	\N	t	\N	2026-01-05 07:25:16.337982+00	\N
3277	24	16	5	TURQUOISE MEDIUM	H&M	86-206	\N	t	\N	2026-01-05 07:25:16.346971+00	\N
3278	24	16	4	TURQUOISE BRIGHT	H&M	86-205	\N	t	\N	2026-01-05 07:25:16.354612+00	\N
3279	24	16	5	TURQUOISE MEDIUM	H&M	86-204	\N	t	\N	2026-01-05 07:25:16.363076+00	\N
3280	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	86-203	\N	t	\N	2026-01-05 07:25:16.370409+00	\N
3281	24	16	2	TURQUOISE DARK	H&M	86-202	\N	t	\N	2026-01-05 07:25:16.377065+00	\N
3282	24	16	2	TURQUOISE DARK	H&M	86-201	\N	t	\N	2026-01-05 07:25:16.387271+00	\N
3283	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	86-114	\N	t	\N	2026-01-05 07:25:16.395665+00	\N
3284	24	16	2	TURQUOISE DARK	H&M	86-113	\N	t	\N	2026-01-05 07:25:16.403678+00	\N
3285	24	16	2	TURQUOISE DARK	H&M	86-112	\N	t	\N	2026-01-05 07:25:16.411022+00	\N
3286	24	16	2	TURQUOISE DARK	H&M	86-111	\N	t	\N	2026-01-05 07:25:16.41949+00	\N
3287	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	86-110	\N	t	\N	2026-01-05 07:25:16.425402+00	\N
3288	24	16	2	TURQUOISE DARK	H&M	86-109	\N	t	\N	2026-01-05 07:25:16.434548+00	\N
3289	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	86-108	\N	t	\N	2026-01-05 07:25:16.441279+00	\N
3290	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	86-107	\N	t	\N	2026-01-05 07:25:16.450606+00	\N
3291	24	16	2	TURQUOISE DARK	H&M	86-106	\N	t	\N	2026-01-05 07:25:16.457231+00	\N
3292	24	16	2	TURQUOISE DARK	H&M	86-105	\N	t	\N	2026-01-05 07:25:16.466551+00	\N
3293	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	86-104	\N	t	\N	2026-01-05 07:25:16.47326+00	\N
3294	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	86-103	\N	t	\N	2026-01-05 07:25:16.482999+00	\N
3295	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	86-101	\N	t	\N	2026-01-05 07:25:16.490129+00	\N
3296	24	16	4	TURQUOISE BRIGHT	H&M	85-306	\N	t	\N	2026-01-05 07:25:16.499675+00	\N
3297	24	16	4	TURQUOISE BRIGHT	H&M	85-305	\N	t	\N	2026-01-05 07:25:16.506951+00	\N
3298	24	16	4	TURQUOISE BRIGHT	H&M	85-304	\N	t	\N	2026-01-05 07:25:16.516924+00	\N
3299	24	16	4	TURQUOISE BRIGHT	H&M	85-303	\N	t	\N	2026-01-05 07:25:16.524465+00	\N
3300	24	16	4	TURQUOISE BRIGHT	H&M	85-302	\N	t	\N	2026-01-05 07:25:16.534065+00	\N
3301	24	16	4	TURQUOISE BRIGHT	H&M	85-301	\N	t	\N	2026-01-05 07:25:16.541047+00	\N
3302	24	16	4	TURQUOISE BRIGHT	H&M	85-207	\N	t	\N	2026-01-05 07:25:16.550704+00	\N
3303	24	16	6	TURQUOISE LIGHT	H&M	85-206	\N	t	\N	2026-01-05 07:25:16.557757+00	\N
3304	24	16	5	TURQUOISE MEDIUM	H&M	85-205	\N	t	\N	2026-01-05 07:25:16.567556+00	\N
3305	24	16	4	TURQUOISE BRIGHT	H&M	85-203	\N	t	\N	2026-01-05 07:25:16.574635+00	\N
3306	24	16	5	TURQUOISE MEDIUM	H&M	85-202	\N	t	\N	2026-01-05 07:25:16.584282+00	\N
3307	24	16	5	TURQUOISE MEDIUM	H&M	85-201	\N	t	\N	2026-01-05 07:25:16.591142+00	\N
3308	24	16	3	TURQUOISE DUSTY LIGHT	H&M	85-115	\N	t	\N	2026-01-05 07:25:16.600562+00	\N
3309	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	85-114	\N	t	\N	2026-01-05 07:25:16.6076+00	\N
3310	24	16	5	TURQUOISE MEDIUM	H&M	85-113	\N	t	\N	2026-01-05 07:25:16.617391+00	\N
3311	24	16	3	TURQUOISE DUSTY LIGHT	H&M	85-111	\N	t	\N	2026-01-05 07:25:16.624276+00	\N
3312	24	16	3	TURQUOISE DUSTY LIGHT	H&M	85-110	\N	t	\N	2026-01-05 07:25:16.634091+00	\N
3313	24	16	3	TURQUOISE DUSTY LIGHT	H&M	85-109	\N	t	\N	2026-01-05 07:25:16.641176+00	\N
3314	24	16	3	TURQUOISE DUSTY LIGHT	H&M	85-108	\N	t	\N	2026-01-05 07:25:16.650721+00	\N
3315	24	16	6	TURQUOISE LIGHT	H&M	85-107	\N	t	\N	2026-01-05 07:25:16.657599+00	\N
3316	24	16	3	TURQUOISE DUSTY LIGHT	H&M	85-106	\N	t	\N	2026-01-05 07:25:16.667865+00	\N
3317	24	16	3	TURQUOISE DUSTY LIGHT	H&M	85-105	\N	t	\N	2026-01-05 07:25:16.67571+00	\N
3318	24	16	3	TURQUOISE DUSTY LIGHT	H&M	85-104	\N	t	\N	2026-01-05 07:25:16.686916+00	\N
3319	24	16	3	TURQUOISE DUSTY LIGHT	H&M	85-103	\N	t	\N	2026-01-05 07:25:16.69581+00	\N
3320	24	16	3	TURQUOISE DUSTY LIGHT	H&M	85-102	\N	t	\N	2026-01-05 07:25:16.703311+00	\N
3321	24	16	4	TURQUOISE BRIGHT	H&M	84-311	\N	t	\N	2026-01-05 07:25:16.713068+00	\N
3322	24	16	6	TURQUOISE LIGHT	H&M	84-310	\N	t	\N	2026-01-05 07:25:16.721586+00	\N
3323	24	16	6	TURQUOISE LIGHT	H&M	84-309	\N	t	\N	2026-01-05 07:25:16.730056+00	\N
3324	24	16	6	TURQUOISE LIGHT	H&M	84-308	\N	t	\N	2026-01-05 07:25:16.739065+00	\N
3325	24	16	6	TURQUOISE LIGHT	H&M	84-307	\N	t	\N	2026-01-05 07:25:16.753786+00	\N
3326	24	16	6	TURQUOISE LIGHT	H&M	84-306	\N	t	\N	2026-01-05 07:25:16.763585+00	\N
3327	24	16	6	TURQUOISE LIGHT	H&M	84-305	\N	t	\N	2026-01-05 07:25:16.771408+00	\N
3328	24	16	6	TURQUOISE LIGHT	H&M	84-304	\N	t	\N	2026-01-05 07:25:16.780216+00	\N
3329	24	16	6	TURQUOISE LIGHT	H&M	84-303	\N	t	\N	2026-01-05 07:25:16.787965+00	\N
3330	24	16	6	TURQUOISE LIGHT	H&M	84-302	\N	t	\N	2026-01-05 07:25:16.796929+00	\N
3331	24	16	6	TURQUOISE LIGHT	H&M	84-301	\N	t	\N	2026-01-05 07:25:16.804344+00	\N
3332	24	16	6	TURQUOISE LIGHT	H&M	84-212	\N	t	\N	2026-01-05 07:25:16.813272+00	\N
3333	24	16	6	TURQUOISE LIGHT	H&M	84-211	\N	t	\N	2026-01-05 07:25:16.820931+00	\N
3334	24	16	6	TURQUOISE LIGHT	H&M	84-210	\N	t	\N	2026-01-05 07:25:16.829721+00	\N
3335	24	16	6	TURQUOISE LIGHT	H&M	84-209	\N	t	\N	2026-01-05 07:25:16.83749+00	\N
3336	24	16	6	TURQUOISE LIGHT	H&M	84-208	\N	t	\N	2026-01-05 07:25:16.846804+00	\N
3337	24	16	6	TURQUOISE LIGHT	H&M	84-207	\N	t	\N	2026-01-05 07:25:16.855233+00	\N
3338	24	16	3	TURQUOISE DUSTY LIGHT	H&M	84-206	\N	t	\N	2026-01-05 07:25:16.863659+00	\N
3339	24	16	6	TURQUOISE LIGHT	H&M	84-205	\N	t	\N	2026-01-05 07:25:16.871404+00	\N
3340	24	16	6	TURQUOISE LIGHT	H&M	84-204	\N	t	\N	2026-01-05 07:25:16.879887+00	\N
3341	24	16	6	TURQUOISE LIGHT	H&M	84-202	\N	t	\N	2026-01-05 07:25:16.887355+00	\N
3342	24	16	6	TURQUOISE LIGHT	H&M	84-201	\N	t	\N	2026-01-05 07:25:16.896565+00	\N
3343	24	16	6	TURQUOISE LIGHT	H&M	84-109	\N	t	\N	2026-01-05 07:25:16.904206+00	\N
3344	24	16	6	TURQUOISE LIGHT	H&M	84-108	\N	t	\N	2026-01-05 07:25:16.913002+00	\N
3345	24	16	3	TURQUOISE DUSTY LIGHT	H&M	84-107	\N	t	\N	2026-01-05 07:25:16.920709+00	\N
3346	24	16	6	TURQUOISE LIGHT	H&M	84-106	\N	t	\N	2026-01-05 07:25:16.929564+00	\N
3347	24	16	3	TURQUOISE DUSTY LIGHT	H&M	84-105	\N	t	\N	2026-01-05 07:25:16.937067+00	\N
3348	24	16	3	TURQUOISE DUSTY LIGHT	H&M	84-104	\N	t	\N	2026-01-05 07:25:16.946847+00	\N
3349	24	16	3	TURQUOISE DUSTY LIGHT	H&M	84-103	\N	t	\N	2026-01-05 07:25:16.954192+00	\N
3350	24	16	3	TURQUOISE DUSTY LIGHT	H&M	84-101	\N	t	\N	2026-01-05 07:25:16.962947+00	\N
3351	24	16	2	TURQUOISE DARK	H&M	83-308	\N	t	\N	2026-01-05 07:25:16.969906+00	\N
3352	24	16	5	TURQUOISE MEDIUM	H&M	83-307	\N	t	\N	2026-01-05 07:25:16.976204+00	\N
3353	24	16	2	TURQUOISE DARK	H&M	83-306	\N	t	\N	2026-01-05 07:25:16.986966+00	\N
3354	24	16	4	TURQUOISE BRIGHT	H&M	83-305	\N	t	\N	2026-01-05 07:25:16.997072+00	\N
3355	24	16	4	TURQUOISE BRIGHT	H&M	83-304	\N	t	\N	2026-01-05 07:25:17.003861+00	\N
3356	24	16	5	TURQUOISE MEDIUM	H&M	83-303	\N	t	\N	2026-01-05 07:25:17.014969+00	\N
3357	24	16	2	TURQUOISE DARK	H&M	83-218	\N	t	\N	2026-01-05 07:25:17.024676+00	\N
3358	24	16	2	TURQUOISE DARK	H&M	83-217	\N	t	\N	2026-01-05 07:25:17.03935+00	\N
3359	24	16	5	TURQUOISE MEDIUM	H&M	83-216	\N	t	\N	2026-01-05 07:25:17.052954+00	\N
3360	24	16	5	TURQUOISE MEDIUM	H&M	83-215	\N	t	\N	2026-01-05 07:25:17.06367+00	\N
3361	24	16	5	TURQUOISE MEDIUM	H&M	83-214	\N	t	\N	2026-01-05 07:25:17.071812+00	\N
3362	24	16	5	TURQUOISE MEDIUM	H&M	83-213	\N	t	\N	2026-01-05 07:25:17.083521+00	\N
3363	24	16	5	TURQUOISE MEDIUM	H&M	83-212	\N	t	\N	2026-01-05 07:25:17.091425+00	\N
3364	24	16	5	TURQUOISE MEDIUM	H&M	83-211	\N	t	\N	2026-01-05 07:25:17.102409+00	\N
3365	24	16	2	TURQUOISE DARK	H&M	83-210	\N	t	\N	2026-01-05 07:25:17.11339+00	\N
3366	24	16	2	TURQUOISE DARK	H&M	83-209	\N	t	\N	2026-01-05 07:25:17.122653+00	\N
3367	24	16	5	TURQUOISE MEDIUM	H&M	83-208	\N	t	\N	2026-01-05 07:25:17.139632+00	\N
3368	24	16	5	TURQUOISE MEDIUM	H&M	83-207	\N	t	\N	2026-01-05 07:25:17.151753+00	\N
3369	24	16	2	TURQUOISE DARK	H&M	83-206	\N	t	\N	2026-01-05 07:25:17.159467+00	\N
3370	24	16	2	TURQUOISE DARK	H&M	83-205	\N	t	\N	2026-01-05 07:25:17.171083+00	\N
3371	24	16	2	TURQUOISE DARK	H&M	83-204	\N	t	\N	2026-01-05 07:25:17.18172+00	\N
3372	24	16	2	TURQUOISE DARK	H&M	83-203	\N	t	\N	2026-01-05 07:25:17.190969+00	\N
3373	24	16	2	TURQUOISE DARK	H&M	83-202	\N	t	\N	2026-01-05 07:25:17.2049+00	\N
3374	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	83-201	\N	t	\N	2026-01-05 07:25:17.215077+00	\N
3375	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	83-109	\N	t	\N	2026-01-05 07:25:17.223682+00	\N
3376	24	16	2	TURQUOISE DARK	H&M	83-108	\N	t	\N	2026-01-05 07:25:17.233853+00	\N
3377	24	16	2	TURQUOISE DARK	H&M	83-107	\N	t	\N	2026-01-05 07:25:17.240296+00	\N
3378	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	83-105	\N	t	\N	2026-01-05 07:25:17.249719+00	\N
3379	24	16	2	TURQUOISE DARK	H&M	83-103	\N	t	\N	2026-01-05 07:25:17.256355+00	\N
3380	24	16	2	TURQUOISE DARK	H&M	83-102	\N	t	\N	2026-01-05 07:25:17.265735+00	\N
3381	24	16	2	TURQUOISE DARK	H&M	83-101	\N	t	\N	2026-01-05 07:25:17.272721+00	\N
3382	24	16	4	TURQUOISE BRIGHT	H&M	82-307	\N	t	\N	2026-01-05 07:25:17.280875+00	\N
3383	24	16	4	TURQUOISE BRIGHT	H&M	82-306	\N	t	\N	2026-01-05 07:25:17.287147+00	\N
3384	24	16	4	TURQUOISE BRIGHT	H&M	82-305	\N	t	\N	2026-01-05 07:25:17.293924+00	\N
3385	24	16	4	TURQUOISE BRIGHT	H&M	82-303	\N	t	\N	2026-01-05 07:25:17.303279+00	\N
3386	24	16	4	TURQUOISE BRIGHT	H&M	82-302	\N	t	\N	2026-01-05 07:25:17.309944+00	\N
3387	24	16	4	TURQUOISE BRIGHT	H&M	82-301	\N	t	\N	2026-01-05 07:25:17.319138+00	\N
3388	24	16	5	TURQUOISE MEDIUM	H&M	82-212	\N	t	\N	2026-01-05 07:25:17.324755+00	\N
3389	24	16	4	TURQUOISE BRIGHT	H&M	82-211	\N	t	\N	2026-01-05 07:25:17.333644+00	\N
3390	24	16	4	TURQUOISE BRIGHT	H&M	82-210	\N	t	\N	2026-01-05 07:25:17.339389+00	\N
3391	24	16	5	TURQUOISE MEDIUM	H&M	82-209	\N	t	\N	2026-01-05 07:25:17.348218+00	\N
3392	24	16	4	TURQUOISE BRIGHT	H&M	82-208	\N	t	\N	2026-01-05 07:25:17.354952+00	\N
3393	24	16	6	TURQUOISE LIGHT	H&M	82-207	\N	t	\N	2026-01-05 07:25:17.363141+00	\N
3394	24	16	6	TURQUOISE LIGHT	H&M	82-206	\N	t	\N	2026-01-05 07:25:17.370324+00	\N
3395	24	16	6	TURQUOISE LIGHT	H&M	82-205	\N	t	\N	2026-01-05 07:25:17.378968+00	\N
3396	24	16	4	TURQUOISE BRIGHT	H&M	82-204	\N	t	\N	2026-01-05 07:25:17.387116+00	\N
3397	24	16	5	TURQUOISE MEDIUM	H&M	82-203	\N	t	\N	2026-01-05 07:25:17.395929+00	\N
3398	24	16	4	TURQUOISE BRIGHT	H&M	82-202	\N	t	\N	2026-01-05 07:25:17.402686+00	\N
3399	24	16	4	TURQUOISE BRIGHT	H&M	82-201	\N	t	\N	2026-01-05 07:25:17.408234+00	\N
3400	24	16	3	TURQUOISE DUSTY LIGHT	H&M	82-108	\N	t	\N	2026-01-05 07:25:17.417776+00	\N
3401	24	16	5	TURQUOISE MEDIUM	H&M	82-106	\N	t	\N	2026-01-05 07:25:17.424439+00	\N
3402	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	82-104	\N	t	\N	2026-01-05 07:25:17.43375+00	\N
3403	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	82-103	\N	t	\N	2026-01-05 07:25:17.440157+00	\N
3404	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	82-102	\N	t	\N	2026-01-05 07:25:17.449544+00	\N
3405	24	16	6	TURQUOISE LIGHT	H&M	81-307	\N	t	\N	2026-01-05 07:25:17.455964+00	\N
3406	24	16	6	TURQUOISE LIGHT	H&M	81-306	\N	t	\N	2026-01-05 07:25:17.464101+00	\N
3407	24	16	3	TURQUOISE DUSTY LIGHT	H&M	81-305	\N	t	\N	2026-01-05 07:25:17.471072+00	\N
3408	24	16	6	TURQUOISE LIGHT	H&M	81-304	\N	t	\N	2026-01-05 07:25:17.479265+00	\N
3409	24	16	6	TURQUOISE LIGHT	H&M	81-303	\N	t	\N	2026-01-05 07:25:17.486602+00	\N
3410	24	16	6	TURQUOISE LIGHT	H&M	81-302	\N	t	\N	2026-01-05 07:25:17.494191+00	\N
3411	24	16	6	TURQUOISE LIGHT	H&M	81-301	\N	t	\N	2026-01-05 07:25:17.502634+00	\N
3412	24	16	6	TURQUOISE LIGHT	H&M	81-208	\N	t	\N	2026-01-05 07:25:17.509952+00	\N
3413	24	16	6	TURQUOISE LIGHT	H&M	81-207	\N	t	\N	2026-01-05 07:25:17.518831+00	\N
3414	24	16	6	TURQUOISE LIGHT	H&M	81-206	\N	t	\N	2026-01-05 07:25:17.524412+00	\N
3415	24	16	6	TURQUOISE LIGHT	H&M	81-205	\N	t	\N	2026-01-05 07:25:17.533773+00	\N
3416	24	16	6	TURQUOISE LIGHT	H&M	81-204	\N	t	\N	2026-01-05 07:25:17.539601+00	\N
3417	24	16	6	TURQUOISE LIGHT	H&M	81-203	\N	t	\N	2026-01-05 07:25:17.551192+00	\N
3418	24	16	6	TURQUOISE LIGHT	H&M	81-202	\N	t	\N	2026-01-05 07:25:17.561267+00	\N
3419	24	16	6	TURQUOISE LIGHT	H&M	81-201	\N	t	\N	2026-01-05 07:25:17.569617+00	\N
3420	24	16	6	TURQUOISE LIGHT	H&M	81-109	\N	t	\N	2026-01-05 07:25:17.575951+00	\N
3421	24	16	3	TURQUOISE DUSTY LIGHT	H&M	81-108	\N	t	\N	2026-01-05 07:25:17.585474+00	\N
3422	24	16	3	TURQUOISE DUSTY LIGHT	H&M	81-105	\N	t	\N	2026-01-05 07:25:17.591731+00	\N
3423	24	16	3	TURQUOISE DUSTY LIGHT	H&M	81-102	\N	t	\N	2026-01-05 07:25:17.602489+00	\N
3424	24	16	3	TURQUOISE DUSTY LIGHT	H&M	81-101	\N	t	\N	2026-01-05 07:25:17.608868+00	\N
3425	24	16	4	TURQUOISE BRIGHT	H&M	80-304	\N	t	\N	2026-01-05 07:25:17.61885+00	\N
3426	24	16	4	TURQUOISE BRIGHT	H&M	80-204	\N	t	\N	2026-01-05 07:25:17.626737+00	\N
3427	24	16	2	TURQUOISE DARK	H&M	79-306	\N	t	\N	2026-01-05 07:25:17.635995+00	\N
3428	24	16	2	TURQUOISE DARK	H&M	79-301	\N	t	\N	2026-01-05 07:25:17.6454+00	\N
3429	24	16	2	TURQUOISE DARK	H&M	79-222	\N	t	\N	2026-01-05 07:25:17.653374+00	\N
3430	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	79-215	\N	t	\N	2026-01-05 07:25:17.661323+00	\N
3431	24	16	2	TURQUOISE DARK	H&M	79-207	\N	t	\N	2026-01-05 07:25:17.669395+00	\N
3432	24	16	2	TURQUOISE DARK	H&M	79-206	\N	t	\N	2026-01-05 07:25:17.677593+00	\N
3433	24	16	2	TURQUOISE DARK	H&M	79-201	\N	t	\N	2026-01-05 07:25:17.685982+00	\N
3434	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	79-121	\N	t	\N	2026-01-05 07:25:17.69247+00	\N
3435	24	16	2	TURQUOISE DARK	H&M	79-114	\N	t	\N	2026-01-05 07:25:17.702563+00	\N
3436	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	79-113	\N	t	\N	2026-01-05 07:25:17.709438+00	\N
3437	24	16	1	TURQUOISE MEDIUM DUSTY	H&M	79-107	\N	t	\N	2026-01-05 07:25:17.719391+00	\N
3438	24	16	2	TURQUOISE DARK	H&M	79-101	\N	t	\N	2026-01-05 07:25:17.728431+00	\N
3439	24	16	4	TURQUOISE BRIGHT	H&M	78-308	\N	t	\N	2026-01-05 07:25:17.739479+00	\N
3440	24	16	4	TURQUOISE BRIGHT	H&M	78-303	\N	t	\N	2026-01-05 07:25:17.762458+00	\N
3441	24	16	4	TURQUOISE BRIGHT	H&M	78-302	\N	t	\N	2026-01-05 07:25:17.786429+00	\N
3442	24	16	6	TURQUOISE LIGHT	H&M	77-305	\N	t	\N	2026-01-05 07:25:17.804033+00	\N
3443	25	17	7	UNDEFINED UNDEFINED	H&M	25-322	\N	t	\N	2026-01-05 07:25:17.820293+00	\N
3444	25	17	7	UNDEFINED UNDEFINED	H&M	08-200	\N	t	\N	2026-01-05 07:25:17.839475+00	\N
3445	25	17	7	UNDEFINED UNDEFINED	H&M	01-099	\N	t	\N	2026-01-05 07:25:17.867383+00	\N
3446	25	17	7	UNDEFINED UNDEFINED	H&M	01-098	\N	t	\N	2026-01-05 07:25:17.88113+00	\N
3447	25	17	7	UNDEFINED UNDEFINED	H&M	01-097	\N	t	\N	2026-01-05 07:25:17.889844+00	\N
3448	25	17	7	UNDEFINED UNDEFINED	H&M	01-096	\N	t	\N	2026-01-05 07:25:17.904887+00	\N
3449	25	17	7	UNDEFINED UNDEFINED	H&M	01-095	\N	t	\N	2026-01-05 07:25:17.919714+00	\N
3450	25	17	7	UNDEFINED UNDEFINED	H&M	01-094	\N	t	\N	2026-01-05 07:25:17.93138+00	\N
3451	25	17	7	UNDEFINED UNDEFINED	H&M	01-093	\N	t	\N	2026-01-05 07:25:17.940208+00	\N
3452	25	17	7	UNDEFINED UNDEFINED	H&M	01-092	\N	t	\N	2026-01-05 07:25:17.954153+00	\N
3453	25	17	7	UNDEFINED UNDEFINED	H&M	01-091	\N	t	\N	2026-01-05 07:25:17.967561+00	\N
3454	25	17	7	UNDEFINED UNDEFINED	H&M	01-090	\N	t	\N	2026-01-05 07:25:17.976349+00	\N
3455	25	17	7	UNDEFINED UNDEFINED	H&M	01-089	\N	t	\N	2026-01-05 07:25:17.986998+00	\N
3456	25	17	7	UNDEFINED UNDEFINED	H&M	01-088	\N	t	\N	2026-01-05 07:25:18.004583+00	\N
3457	25	17	7	UNDEFINED UNDEFINED	H&M	01-087	\N	t	\N	2026-01-05 07:25:18.014728+00	\N
3458	25	17	7	UNDEFINED UNDEFINED	H&M	01-086	\N	t	\N	2026-01-05 07:25:18.021893+00	\N
3459	25	17	7	UNDEFINED UNDEFINED	H&M	01-085	\N	t	\N	2026-01-05 07:25:18.031403+00	\N
3460	25	17	7	UNDEFINED UNDEFINED	H&M	01-084	\N	t	\N	2026-01-05 07:25:18.038773+00	\N
3461	25	17	7	UNDEFINED UNDEFINED	H&M	01-083	\N	t	\N	2026-01-05 07:25:18.048721+00	\N
3462	25	17	7	UNDEFINED UNDEFINED	H&M	01-082	\N	t	\N	2026-01-05 07:25:18.055585+00	\N
3463	25	17	7	UNDEFINED UNDEFINED	H&M	01-081	\N	t	\N	2026-01-05 07:25:18.065558+00	\N
3464	25	17	7	UNDEFINED UNDEFINED	H&M	01-080	\N	t	\N	2026-01-05 07:25:18.071839+00	\N
3465	25	17	7	UNDEFINED UNDEFINED	H&M	01-079	\N	t	\N	2026-01-05 07:25:18.080399+00	\N
3466	25	17	7	UNDEFINED UNDEFINED	H&M	01-078	\N	t	\N	2026-01-05 07:25:18.088172+00	\N
3467	25	17	7	UNDEFINED UNDEFINED	H&M	01-077	\N	t	\N	2026-01-05 07:25:18.095456+00	\N
3468	25	17	7	UNDEFINED UNDEFINED	H&M	01-076	\N	t	\N	2026-01-05 07:25:18.10214+00	\N
3469	25	17	7	UNDEFINED UNDEFINED	H&M	01-075	\N	t	\N	2026-01-05 07:25:18.107517+00	\N
3470	25	17	7	UNDEFINED UNDEFINED	H&M	01-074	\N	t	\N	2026-01-05 07:25:18.116766+00	\N
3471	25	17	7	UNDEFINED UNDEFINED	H&M	01-073	\N	t	\N	2026-01-05 07:25:18.122512+00	\N
3472	25	17	7	UNDEFINED UNDEFINED	H&M	01-072	\N	t	\N	2026-01-05 07:25:18.131758+00	\N
3473	25	17	7	UNDEFINED UNDEFINED	H&M	01-071	\N	t	\N	2026-01-05 07:25:18.138065+00	\N
3474	25	17	7	UNDEFINED UNDEFINED	H&M	01-070	\N	t	\N	2026-01-05 07:25:18.145904+00	\N
3475	25	17	7	UNDEFINED UNDEFINED	H&M	01-069	\N	t	\N	2026-01-05 07:25:18.153044+00	\N
3476	25	17	7	UNDEFINED UNDEFINED	H&M	01-068	\N	t	\N	2026-01-05 07:25:18.161647+00	\N
3477	25	17	7	UNDEFINED UNDEFINED	H&M	01-067	\N	t	\N	2026-01-05 07:25:18.169239+00	\N
3478	25	17	7	UNDEFINED UNDEFINED	H&M	01-066	\N	t	\N	2026-01-05 07:25:18.178341+00	\N
3479	25	17	7	UNDEFINED UNDEFINED	H&M	01-065	\N	t	\N	2026-01-05 07:25:18.186392+00	\N
3480	25	17	7	UNDEFINED UNDEFINED	H&M	01-064	\N	t	\N	2026-01-05 07:25:18.195264+00	\N
3481	25	17	7	UNDEFINED UNDEFINED	H&M	01-063	\N	t	\N	2026-01-05 07:25:18.20299+00	\N
3482	25	17	7	UNDEFINED UNDEFINED	H&M	01-062	\N	t	\N	2026-01-05 07:25:18.211706+00	\N
3483	25	17	7	UNDEFINED UNDEFINED	H&M	01-061	\N	t	\N	2026-01-05 07:25:18.218989+00	\N
3484	25	17	7	UNDEFINED UNDEFINED	H&M	01-060	\N	t	\N	2026-01-05 07:25:18.226436+00	\N
3485	25	17	7	UNDEFINED UNDEFINED	H&M	01-059	\N	t	\N	2026-01-05 07:25:18.238527+00	\N
3486	25	17	7	UNDEFINED UNDEFINED	H&M	01-058	\N	t	\N	2026-01-05 07:25:18.249462+00	\N
3487	25	17	7	UNDEFINED UNDEFINED	H&M	01-057	\N	t	\N	2026-01-05 07:25:18.255685+00	\N
3488	25	17	7	UNDEFINED UNDEFINED	H&M	01-056	\N	t	\N	2026-01-05 07:25:18.26418+00	\N
3489	25	17	7	UNDEFINED UNDEFINED	H&M	01-055	\N	t	\N	2026-01-05 07:25:18.27088+00	\N
3490	25	17	7	UNDEFINED UNDEFINED	H&M	01-054	\N	t	\N	2026-01-05 07:25:18.279035+00	\N
3491	25	17	7	UNDEFINED UNDEFINED	H&M	01-053	\N	t	\N	2026-01-05 07:25:18.286232+00	\N
3492	25	17	7	UNDEFINED UNDEFINED	H&M	01-052	\N	t	\N	2026-01-05 07:25:18.294513+00	\N
3493	25	17	7	UNDEFINED UNDEFINED	H&M	01-051	\N	t	\N	2026-01-05 07:25:18.302745+00	\N
3494	25	17	7	UNDEFINED UNDEFINED	H&M	01-050	\N	t	\N	2026-01-05 07:25:18.31175+00	\N
3495	25	17	7	UNDEFINED UNDEFINED	H&M	01-049	\N	t	\N	2026-01-05 07:25:18.319461+00	\N
3496	25	17	7	UNDEFINED UNDEFINED	H&M	01-048	\N	t	\N	2026-01-05 07:25:18.328189+00	\N
3497	25	17	7	UNDEFINED UNDEFINED	H&M	01-047	\N	t	\N	2026-01-05 07:25:18.335872+00	\N
3498	25	17	7	UNDEFINED UNDEFINED	H&M	01-046	\N	t	\N	2026-01-05 07:25:18.344991+00	\N
3499	25	17	7	UNDEFINED UNDEFINED	H&M	01-045	\N	t	\N	2026-01-05 07:25:18.353377+00	\N
3500	25	17	7	UNDEFINED UNDEFINED	H&M	01-044	\N	t	\N	2026-01-05 07:25:18.361794+00	\N
3501	25	17	7	UNDEFINED UNDEFINED	H&M	01-043	\N	t	\N	2026-01-05 07:25:18.369744+00	\N
3502	25	17	7	UNDEFINED UNDEFINED	H&M	01-042	\N	t	\N	2026-01-05 07:25:18.378577+00	\N
3503	25	17	7	UNDEFINED UNDEFINED	H&M	01-041	\N	t	\N	2026-01-05 07:25:18.386327+00	\N
3504	25	17	7	UNDEFINED UNDEFINED	H&M	01-040	\N	t	\N	2026-01-05 07:25:18.395348+00	\N
3505	25	17	7	UNDEFINED UNDEFINED	H&M	01-039	\N	t	\N	2026-01-05 07:25:18.403258+00	\N
3506	25	17	7	UNDEFINED UNDEFINED	H&M	01-038	\N	t	\N	2026-01-05 07:25:18.411962+00	\N
3507	25	17	7	UNDEFINED UNDEFINED	H&M	01-037	\N	t	\N	2026-01-05 07:25:18.419629+00	\N
3508	25	17	7	UNDEFINED UNDEFINED	H&M	01-036	\N	t	\N	2026-01-05 07:25:18.428677+00	\N
3509	25	17	7	UNDEFINED UNDEFINED	H&M	01-035	\N	t	\N	2026-01-05 07:25:18.436926+00	\N
3510	25	17	7	UNDEFINED UNDEFINED	H&M	01-034	\N	t	\N	2026-01-05 07:25:18.445407+00	\N
3511	25	17	7	UNDEFINED UNDEFINED	H&M	01-033	\N	t	\N	2026-01-05 07:25:18.452794+00	\N
3512	25	17	7	UNDEFINED UNDEFINED	H&M	01-032	\N	t	\N	2026-01-05 07:25:18.461111+00	\N
3513	25	17	7	UNDEFINED UNDEFINED	H&M	01-031	\N	t	\N	2026-01-05 07:25:18.469387+00	\N
3514	25	17	7	UNDEFINED UNDEFINED	H&M	01-030	\N	t	\N	2026-01-05 07:25:18.478266+00	\N
3515	25	17	7	UNDEFINED UNDEFINED	H&M	01-029	\N	t	\N	2026-01-05 07:25:18.485824+00	\N
3516	25	17	7	UNDEFINED UNDEFINED	H&M	01-028	\N	t	\N	2026-01-05 07:25:18.495724+00	\N
3517	25	17	7	UNDEFINED UNDEFINED	H&M	01-027	\N	t	\N	2026-01-05 07:25:18.503461+00	\N
3518	25	17	7	UNDEFINED UNDEFINED	H&M	01-026	\N	t	\N	2026-01-05 07:25:18.512869+00	\N
3519	25	17	7	UNDEFINED UNDEFINED	H&M	01-025	\N	t	\N	2026-01-05 07:25:18.519739+00	\N
3520	25	17	7	UNDEFINED UNDEFINED	H&M	01-024	\N	t	\N	2026-01-05 07:25:18.528473+00	\N
3521	25	17	7	UNDEFINED UNDEFINED	H&M	01-023	\N	t	\N	2026-01-05 07:25:18.536984+00	\N
3522	25	17	7	UNDEFINED UNDEFINED	H&M	01-022	\N	t	\N	2026-01-05 07:25:18.545637+00	\N
3523	25	17	7	UNDEFINED UNDEFINED	H&M	01-021	\N	t	\N	2026-01-05 07:25:18.55323+00	\N
3524	25	17	7	UNDEFINED UNDEFINED	H&M	01-020	\N	t	\N	2026-01-05 07:25:18.561695+00	\N
3525	25	17	7	UNDEFINED UNDEFINED	H&M	01-019	\N	t	\N	2026-01-05 07:25:18.569322+00	\N
3526	25	17	7	UNDEFINED UNDEFINED	H&M	01-018	\N	t	\N	2026-01-05 07:25:18.578255+00	\N
3527	25	17	7	UNDEFINED UNDEFINED	H&M	01-017	\N	t	\N	2026-01-05 07:25:18.585764+00	\N
3528	25	17	7	UNDEFINED UNDEFINED	H&M	01-016	\N	t	\N	2026-01-05 07:25:18.595076+00	\N
3529	25	17	7	UNDEFINED UNDEFINED	H&M	01-015	\N	t	\N	2026-01-05 07:25:18.603865+00	\N
3530	25	17	7	UNDEFINED UNDEFINED	H&M	01-014	\N	t	\N	2026-01-05 07:25:18.612384+00	\N
3531	25	17	7	UNDEFINED UNDEFINED	H&M	01-013	\N	t	\N	2026-01-05 07:25:18.621457+00	\N
3532	25	17	7	UNDEFINED UNDEFINED	H&M	01-012	\N	t	\N	2026-01-05 07:25:18.636036+00	\N
3533	25	17	7	UNDEFINED UNDEFINED	H&M	01-011	\N	t	\N	2026-01-05 07:25:18.645784+00	\N
3534	25	17	7	UNDEFINED UNDEFINED	H&M	01-010	\N	t	\N	2026-01-05 07:25:18.653559+00	\N
3535	25	17	7	UNDEFINED UNDEFINED	H&M	01-009	\N	t	\N	2026-01-05 07:25:18.662028+00	\N
3536	25	17	7	UNDEFINED UNDEFINED	H&M	01-008	\N	t	\N	2026-01-05 07:25:18.669709+00	\N
3537	25	17	7	UNDEFINED UNDEFINED	H&M	01-007	\N	t	\N	2026-01-05 07:25:18.67833+00	\N
3538	25	17	7	UNDEFINED UNDEFINED	H&M	01-006	\N	t	\N	2026-01-05 07:25:18.685802+00	\N
3539	25	17	7	UNDEFINED UNDEFINED	H&M	01-005	\N	t	\N	2026-01-05 07:25:18.694112+00	\N
3540	25	17	7	UNDEFINED UNDEFINED	H&M	01-004	\N	t	\N	2026-01-05 07:25:18.702313+00	\N
3541	25	17	7	UNDEFINED UNDEFINED	H&M	01-003	\N	t	\N	2026-01-05 07:25:18.711475+00	\N
3542	25	17	7	UNDEFINED UNDEFINED	H&M	01-002	\N	t	\N	2026-01-05 07:25:18.719203+00	\N
3543	25	17	7	UNDEFINED UNDEFINED	H&M	01-001	\N	t	\N	2026-01-05 07:25:18.728082+00	\N
3544	26	18	3	WHITE DUSTY LIGHT	H&M	61-102	\N	t	\N	2026-01-05 07:25:18.735364+00	\N
3545	26	18	3	WHITE DUSTY LIGHT	H&M	37-107	\N	t	\N	2026-01-05 07:25:18.744684+00	\N
3546	26	18	3	WHITE DUSTY LIGHT	H&M	12-220	\N	t	\N	2026-01-05 07:25:18.752259+00	\N
3547	26	18	3	WHITE DUSTY LIGHT	H&M	12-219	\N	t	\N	2026-01-05 07:25:18.761708+00	\N
3548	26	18	3	WHITE DUSTY LIGHT	H&M	12-207	\N	t	\N	2026-01-05 07:25:18.769929+00	\N
3549	26	18	3	WHITE DUSTY LIGHT	H&M	12-121	\N	t	\N	2026-01-05 07:25:18.778687+00	\N
3550	26	18	3	WHITE DUSTY LIGHT	H&M	12-114	\N	t	\N	2026-01-05 07:25:18.786729+00	\N
3551	26	18	3	WHITE DUSTY LIGHT	H&M	12-113	\N	t	\N	2026-01-05 07:25:18.795165+00	\N
3552	26	18	3	WHITE DUSTY LIGHT	H&M	12-106	\N	t	\N	2026-01-05 07:25:18.802747+00	\N
3553	26	18	3	WHITE DUSTY LIGHT	H&M	11-121	\N	t	\N	2026-01-05 07:25:18.811596+00	\N
3554	26	18	3	WHITE DUSTY LIGHT	H&M	11-120	\N	t	\N	2026-01-05 07:25:18.819151+00	\N
3555	26	18	3	WHITE DUSTY LIGHT	H&M	11-119	\N	t	\N	2026-01-05 07:25:18.827935+00	\N
3556	26	18	3	WHITE DUSTY LIGHT	H&M	11-118	\N	t	\N	2026-01-05 07:25:18.835662+00	\N
3557	26	18	3	WHITE DUSTY LIGHT	H&M	11-116	\N	t	\N	2026-01-05 07:25:18.844945+00	\N
3558	26	18	3	WHITE DUSTY LIGHT	H&M	11-115	\N	t	\N	2026-01-05 07:25:18.851975+00	\N
3559	26	18	3	WHITE DUSTY LIGHT	H&M	11-114	\N	t	\N	2026-01-05 07:25:18.858572+00	\N
3560	26	18	3	WHITE DUSTY LIGHT	H&M	11-113	\N	t	\N	2026-01-05 07:25:18.867858+00	\N
3561	26	18	3	WHITE DUSTY LIGHT	H&M	11-112	\N	t	\N	2026-01-05 07:25:18.874531+00	\N
3562	26	18	3	WHITE DUSTY LIGHT	H&M	11-110	\N	t	\N	2026-01-05 07:25:18.884847+00	\N
3563	26	18	3	WHITE DUSTY LIGHT	H&M	11-109	\N	t	\N	2026-01-05 07:25:18.891945+00	\N
3564	26	18	3	WHITE DUSTY LIGHT	H&M	11-108	\N	t	\N	2026-01-05 07:25:18.900965+00	\N
3565	26	18	3	WHITE DUSTY LIGHT	H&M	11-106	\N	t	\N	2026-01-05 07:25:18.907536+00	\N
3566	26	18	3	WHITE DUSTY LIGHT	H&M	11-105	\N	t	\N	2026-01-05 07:25:18.917974+00	\N
3567	26	18	3	WHITE DUSTY LIGHT	H&M	11-104	\N	t	\N	2026-01-05 07:25:18.925752+00	\N
3568	26	18	3	WHITE DUSTY LIGHT	H&M	11-103	\N	t	\N	2026-01-05 07:25:18.934366+00	\N
3569	26	18	3	WHITE DUSTY LIGHT	H&M	11-102	\N	t	\N	2026-01-05 07:25:18.940519+00	\N
3570	26	18	3	WHITE DUSTY LIGHT	H&M	11-101	\N	t	\N	2026-01-05 07:25:18.950917+00	\N
3571	26	18	6	WHITE LIGHT	H&M	10-217	\N	t	\N	2026-01-05 07:25:18.957902+00	\N
3572	26	18	6	WHITE LIGHT	H&M	10-216	\N	t	\N	2026-01-05 07:25:18.968417+00	\N
3573	26	18	6	WHITE LIGHT	H&M	10-215	\N	t	\N	2026-01-05 07:25:18.977827+00	\N
3574	26	18	6	WHITE LIGHT	H&M	10-213	\N	t	\N	2026-01-05 07:25:18.98574+00	\N
3575	26	18	3	WHITE DUSTY LIGHT	H&M	10-212	\N	t	\N	2026-01-05 07:25:18.994881+00	\N
3576	26	18	6	WHITE LIGHT	H&M	10-211	\N	t	\N	2026-01-05 07:25:19.002687+00	\N
3577	26	18	6	WHITE LIGHT	H&M	10-210	\N	t	\N	2026-01-05 07:25:19.011314+00	\N
3578	26	18	6	WHITE LIGHT	H&M	10-209	\N	t	\N	2026-01-05 07:25:19.018742+00	\N
3579	26	18	6	WHITE LIGHT	H&M	10-208	\N	t	\N	2026-01-05 07:25:19.027871+00	\N
3580	26	18	6	WHITE LIGHT	H&M	10-207	\N	t	\N	2026-01-05 07:25:19.035602+00	\N
3581	26	18	6	WHITE LIGHT	H&M	10-206	\N	t	\N	2026-01-05 07:25:19.044474+00	\N
3582	26	18	6	WHITE LIGHT	H&M	10-205	\N	t	\N	2026-01-05 07:25:19.052024+00	\N
3583	26	18	6	WHITE LIGHT	H&M	10-204	\N	t	\N	2026-01-05 07:25:19.060772+00	\N
3584	26	18	3	WHITE DUSTY LIGHT	H&M	10-203	\N	t	\N	2026-01-05 07:25:19.068445+00	\N
3585	26	18	6	WHITE LIGHT	H&M	10-202	\N	t	\N	2026-01-05 07:25:19.077594+00	\N
3586	26	18	6	WHITE LIGHT	H&M	10-201	\N	t	\N	2026-01-05 07:25:19.085349+00	\N
3587	26	18	6	WHITE LIGHT	H&M	10-100	\N	t	\N	2026-01-05 07:25:19.094702+00	\N
3588	26	18	6	WHITE LIGHT	H&M	02-101	\N	t	\N	2026-01-05 07:25:19.102743+00	\N
3589	27	19	4	YELLOW BRIGHT	H&M	32-311	\N	t	\N	2026-01-05 07:25:19.11519+00	\N
3590	27	19	4	YELLOW BRIGHT	H&M	32-306	\N	t	\N	2026-01-05 07:25:19.127412+00	\N
3591	27	19	4	YELLOW BRIGHT	H&M	32-302	\N	t	\N	2026-01-05 07:25:19.139017+00	\N
3592	27	19	5	YELLOW MEDIUM	H&M	32-203	\N	t	\N	2026-01-05 07:25:19.151826+00	\N
3593	27	19	5	YELLOW MEDIUM	H&M	32-201	\N	t	\N	2026-01-05 07:25:19.161946+00	\N
3594	27	19	5	YELLOW MEDIUM	H&M	31-302	\N	t	\N	2026-01-05 07:25:19.170554+00	\N
3595	27	19	3	YELLOW DUSTY LIGHT	H&M	31-202	\N	t	\N	2026-01-05 07:25:19.184706+00	\N
3596	27	19	3	YELLOW DUSTY LIGHT	H&M	31-112	\N	t	\N	2026-01-05 07:25:19.194876+00	\N
3597	27	19	2	YELLOW DARK	H&M	29-312	\N	t	\N	2026-01-05 07:25:19.202311+00	\N
3598	27	19	2	YELLOW DARK	H&M	29-310	\N	t	\N	2026-01-05 07:25:19.211506+00	\N
3599	27	19	2	YELLOW DARK	H&M	29-309	\N	t	\N	2026-01-05 07:25:19.218797+00	\N
3600	27	19	2	YELLOW DARK	H&M	29-308	\N	t	\N	2026-01-05 07:25:19.227998+00	\N
3601	27	19	2	YELLOW DARK	H&M	29-305	\N	t	\N	2026-01-05 07:25:19.235762+00	\N
3602	27	19	2	YELLOW DARK	H&M	29-304	\N	t	\N	2026-01-05 07:25:19.244739+00	\N
3603	27	19	2	YELLOW DARK	H&M	29-303	\N	t	\N	2026-01-05 07:25:19.25243+00	\N
3604	27	19	2	YELLOW DARK	H&M	29-302	\N	t	\N	2026-01-05 07:25:19.26913+00	\N
3605	27	19	2	YELLOW DARK	H&M	29-301	\N	t	\N	2026-01-05 07:25:19.287901+00	\N
3606	27	19	5	YELLOW MEDIUM	H&M	28-327	\N	t	\N	2026-01-05 07:25:19.297945+00	\N
3607	27	19	5	YELLOW MEDIUM	H&M	28-326	\N	t	\N	2026-01-05 07:25:19.304229+00	\N
3608	27	19	2	YELLOW DARK	H&M	28-325	\N	t	\N	2026-01-05 07:25:19.312422+00	\N
3609	27	19	2	YELLOW DARK	H&M	28-324	\N	t	\N	2026-01-05 07:25:19.318795+00	\N
3610	27	19	5	YELLOW MEDIUM	H&M	28-323	\N	t	\N	2026-01-05 07:25:19.325366+00	\N
3611	27	19	5	YELLOW MEDIUM	H&M	28-322	\N	t	\N	2026-01-05 07:25:19.333008+00	\N
3612	27	19	5	YELLOW MEDIUM	H&M	28-321	\N	t	\N	2026-01-05 07:25:19.338829+00	\N
3613	27	19	4	YELLOW BRIGHT	H&M	28-320	\N	t	\N	2026-01-05 07:25:19.349143+00	\N
3614	27	19	4	YELLOW BRIGHT	H&M	28-319	\N	t	\N	2026-01-05 07:25:19.355673+00	\N
3615	27	19	4	YELLOW BRIGHT	H&M	28-318	\N	t	\N	2026-01-05 07:25:19.364541+00	\N
3616	27	19	5	YELLOW MEDIUM	H&M	28-313	\N	t	\N	2026-01-05 07:25:19.370646+00	\N
3617	27	19	4	YELLOW BRIGHT	H&M	28-311	\N	t	\N	2026-01-05 07:25:19.378372+00	\N
3618	27	19	5	YELLOW MEDIUM	H&M	28-308	\N	t	\N	2026-01-05 07:25:19.384952+00	\N
3619	27	19	4	YELLOW BRIGHT	H&M	28-307	\N	t	\N	2026-01-05 07:25:19.390913+00	\N
3620	27	19	5	YELLOW MEDIUM	H&M	28-306	\N	t	\N	2026-01-05 07:25:19.400358+00	\N
3621	27	19	5	YELLOW MEDIUM	H&M	28-305	\N	t	\N	2026-01-05 07:25:19.406781+00	\N
3622	27	19	5	YELLOW MEDIUM	H&M	28-304	\N	t	\N	2026-01-05 07:25:19.417085+00	\N
3623	27	19	5	YELLOW MEDIUM	H&M	28-303	\N	t	\N	2026-01-05 07:25:19.423354+00	\N
3624	27	19	5	YELLOW MEDIUM	H&M	28-302	\N	t	\N	2026-01-05 07:25:19.432684+00	\N
3625	27	19	5	YELLOW MEDIUM	H&M	28-301	\N	t	\N	2026-01-05 07:25:19.439169+00	\N
3626	27	19	5	YELLOW MEDIUM	H&M	28-213	\N	t	\N	2026-01-05 07:25:19.448516+00	\N
3627	27	19	5	YELLOW MEDIUM	H&M	28-212	\N	t	\N	2026-01-05 07:25:19.455011+00	\N
3628	27	19	1	YELLOW MEDIUM DUSTY	H&M	28-210	\N	t	\N	2026-01-05 07:25:19.465167+00	\N
3629	27	19	5	YELLOW MEDIUM	H&M	28-209	\N	t	\N	2026-01-05 07:25:19.472462+00	\N
3630	27	19	1	YELLOW MEDIUM DUSTY	H&M	28-208	\N	t	\N	2026-01-05 07:25:19.482692+00	\N
3631	27	19	4	YELLOW BRIGHT	H&M	28-207	\N	t	\N	2026-01-05 07:25:19.489756+00	\N
3632	27	19	5	YELLOW MEDIUM	H&M	28-206	\N	t	\N	2026-01-05 07:25:19.49938+00	\N
3633	27	19	5	YELLOW MEDIUM	H&M	28-205	\N	t	\N	2026-01-05 07:25:19.506127+00	\N
3634	27	19	5	YELLOW MEDIUM	H&M	28-204	\N	t	\N	2026-01-05 07:25:19.51635+00	\N
3635	27	19	5	YELLOW MEDIUM	H&M	28-203	\N	t	\N	2026-01-05 07:25:19.523099+00	\N
3636	27	19	5	YELLOW MEDIUM	H&M	28-202	\N	t	\N	2026-01-05 07:25:19.533491+00	\N
3637	27	19	5	YELLOW MEDIUM	H&M	28-201	\N	t	\N	2026-01-05 07:25:19.540596+00	\N
3638	27	19	1	YELLOW MEDIUM DUSTY	H&M	28-114	\N	t	\N	2026-01-05 07:25:19.551105+00	\N
3639	27	19	1	YELLOW MEDIUM DUSTY	H&M	28-111	\N	t	\N	2026-01-05 07:25:19.558367+00	\N
3640	27	19	1	YELLOW MEDIUM DUSTY	H&M	28-110	\N	t	\N	2026-01-05 07:25:19.567285+00	\N
3641	27	19	3	YELLOW DUSTY LIGHT	H&M	28-108	\N	t	\N	2026-01-05 07:25:19.574327+00	\N
3642	27	19	1	YELLOW MEDIUM DUSTY	H&M	28-107	\N	t	\N	2026-01-05 07:25:19.583724+00	\N
3643	27	19	1	YELLOW MEDIUM DUSTY	H&M	28-106	\N	t	\N	2026-01-05 07:25:19.590213+00	\N
3644	27	19	1	YELLOW MEDIUM DUSTY	H&M	28-105	\N	t	\N	2026-01-05 07:25:19.599776+00	\N
3645	27	19	1	YELLOW MEDIUM DUSTY	H&M	28-104	\N	t	\N	2026-01-05 07:25:19.606336+00	\N
3646	27	19	5	YELLOW MEDIUM	H&M	27-305	\N	t	\N	2026-01-05 07:25:19.615588+00	\N
3647	27	19	5	YELLOW MEDIUM	H&M	27-304	\N	t	\N	2026-01-05 07:25:19.62171+00	\N
3648	27	19	6	YELLOW LIGHT	H&M	27-303	\N	t	\N	2026-01-05 07:25:19.631282+00	\N
3649	27	19	5	YELLOW MEDIUM	H&M	27-302	\N	t	\N	2026-01-05 07:25:19.638513+00	\N
3650	27	19	5	YELLOW MEDIUM	H&M	27-301	\N	t	\N	2026-01-05 07:25:19.648792+00	\N
3651	27	19	5	YELLOW MEDIUM	H&M	27-210	\N	t	\N	2026-01-05 07:25:19.65637+00	\N
3652	27	19	3	YELLOW DUSTY LIGHT	H&M	27-209	\N	t	\N	2026-01-05 07:25:19.666217+00	\N
3653	27	19	6	YELLOW LIGHT	H&M	27-208	\N	t	\N	2026-01-05 07:25:19.672863+00	\N
3654	27	19	3	YELLOW DUSTY LIGHT	H&M	27-207	\N	t	\N	2026-01-05 07:25:19.682793+00	\N
3655	27	19	3	YELLOW DUSTY LIGHT	H&M	27-206	\N	t	\N	2026-01-05 07:25:19.689379+00	\N
3656	27	19	3	YELLOW DUSTY LIGHT	H&M	27-205	\N	t	\N	2026-01-05 07:25:19.699179+00	\N
3657	27	19	5	YELLOW MEDIUM	H&M	27-204	\N	t	\N	2026-01-05 07:25:19.705864+00	\N
3658	27	19	5	YELLOW MEDIUM	H&M	27-203	\N	t	\N	2026-01-05 07:25:19.715565+00	\N
3659	27	19	1	YELLOW MEDIUM DUSTY	H&M	27-202	\N	t	\N	2026-01-05 07:25:19.722302+00	\N
3660	27	19	3	YELLOW DUSTY LIGHT	H&M	27-201	\N	t	\N	2026-01-05 07:25:19.731838+00	\N
3661	27	19	3	YELLOW DUSTY LIGHT	H&M	27-115	\N	t	\N	2026-01-05 07:25:19.738416+00	\N
3662	27	19	3	YELLOW DUSTY LIGHT	H&M	27-114	\N	t	\N	2026-01-05 07:25:19.747992+00	\N
3663	27	19	3	YELLOW DUSTY LIGHT	H&M	27-113	\N	t	\N	2026-01-05 07:25:19.754889+00	\N
3664	27	19	3	YELLOW DUSTY LIGHT	H&M	27-112	\N	t	\N	2026-01-05 07:25:19.764551+00	\N
3665	27	19	6	YELLOW LIGHT	H&M	27-111	\N	t	\N	2026-01-05 07:25:19.771543+00	\N
3666	27	19	3	YELLOW DUSTY LIGHT	H&M	27-110	\N	t	\N	2026-01-05 07:25:19.780953+00	\N
3667	27	19	6	YELLOW LIGHT	H&M	27-109	\N	t	\N	2026-01-05 07:25:19.789756+00	\N
3668	27	19	6	YELLOW LIGHT	H&M	27-108	\N	t	\N	2026-01-05 07:25:19.810244+00	\N
3669	27	19	3	YELLOW DUSTY LIGHT	H&M	27-107	\N	t	\N	2026-01-05 07:25:19.821851+00	\N
3670	27	19	3	YELLOW DUSTY LIGHT	H&M	27-106	\N	t	\N	2026-01-05 07:25:19.83377+00	\N
3671	27	19	3	YELLOW DUSTY LIGHT	H&M	27-105	\N	t	\N	2026-01-05 07:25:19.844122+00	\N
3672	27	19	3	YELLOW DUSTY LIGHT	H&M	27-104	\N	t	\N	2026-01-05 07:25:19.852827+00	\N
3673	27	19	3	YELLOW DUSTY LIGHT	H&M	27-103	\N	t	\N	2026-01-05 07:25:19.86342+00	\N
3674	27	19	3	YELLOW DUSTY LIGHT	H&M	27-102	\N	t	\N	2026-01-05 07:25:19.870495+00	\N
3675	27	19	3	YELLOW DUSTY LIGHT	H&M	27-101	\N	t	\N	2026-01-05 07:25:19.880967+00	\N
3676	27	19	2	YELLOW DARK	H&M	26-311	\N	t	\N	2026-01-05 07:25:19.887973+00	\N
3677	27	19	2	YELLOW DARK	H&M	26-304	\N	t	\N	2026-01-05 07:25:19.899362+00	\N
3678	27	19	2	YELLOW DARK	H&M	26-302	\N	t	\N	2026-01-05 07:25:19.906406+00	\N
3679	27	19	2	YELLOW DARK	H&M	26-301	\N	t	\N	2026-01-05 07:25:19.917532+00	\N
3680	27	19	2	YELLOW DARK	H&M	26-210	\N	t	\N	2026-01-05 07:25:19.928103+00	\N
3681	27	19	2	YELLOW DARK	H&M	26-209	\N	t	\N	2026-01-05 07:25:19.936582+00	\N
3682	27	19	2	YELLOW DARK	H&M	26-204	\N	t	\N	2026-01-05 07:25:19.946732+00	\N
3683	27	19	1	YELLOW MEDIUM DUSTY	H&M	26-203	\N	t	\N	2026-01-05 07:25:19.954057+00	\N
3684	27	19	2	YELLOW DARK	H&M	26-202	\N	t	\N	2026-01-05 07:25:19.964878+00	\N
3685	27	19	1	YELLOW MEDIUM DUSTY	H&M	26-102	\N	t	\N	2026-01-05 07:25:19.972203+00	\N
3686	27	19	5	YELLOW MEDIUM	H&M	25-325	\N	t	\N	2026-01-05 07:25:19.983675+00	\N
3687	27	19	4	YELLOW BRIGHT	H&M	25-324	\N	t	\N	2026-01-05 07:25:19.993087+00	\N
3688	27	19	4	YELLOW BRIGHT	H&M	25-323	\N	t	\N	2026-01-05 07:25:20.002723+00	\N
3689	27	19	4	YELLOW BRIGHT	H&M	25-321	\N	t	\N	2026-01-05 07:25:20.014156+00	\N
3690	27	19	4	YELLOW BRIGHT	H&M	25-320	\N	t	\N	2026-01-05 07:25:20.022393+00	\N
3691	27	19	5	YELLOW MEDIUM	H&M	25-319	\N	t	\N	2026-01-05 07:25:20.033375+00	\N
3692	27	19	5	YELLOW MEDIUM	H&M	25-318	\N	t	\N	2026-01-05 07:25:20.041836+00	\N
3693	27	19	1	YELLOW MEDIUM DUSTY	H&M	25-317	\N	t	\N	2026-01-05 07:25:20.051727+00	\N
3694	27	19	1	YELLOW MEDIUM DUSTY	H&M	25-316	\N	t	\N	2026-01-05 07:25:20.061014+00	\N
3695	27	19	5	YELLOW MEDIUM	H&M	25-315	\N	t	\N	2026-01-05 07:25:20.068801+00	\N
3696	27	19	5	YELLOW MEDIUM	H&M	25-314	\N	t	\N	2026-01-05 07:25:20.078021+00	\N
3697	27	19	2	YELLOW DARK	H&M	25-313	\N	t	\N	2026-01-05 07:25:20.085826+00	\N
3698	27	19	4	YELLOW BRIGHT	H&M	25-312	\N	t	\N	2026-01-05 07:25:20.096426+00	\N
3699	27	19	4	YELLOW BRIGHT	H&M	25-311	\N	t	\N	2026-01-05 07:25:20.103934+00	\N
3700	27	19	4	YELLOW BRIGHT	H&M	25-310	\N	t	\N	2026-01-05 07:25:20.115288+00	\N
3701	27	19	4	YELLOW BRIGHT	H&M	25-309	\N	t	\N	2026-01-05 07:25:20.122189+00	\N
3702	27	19	4	YELLOW BRIGHT	H&M	25-308	\N	t	\N	2026-01-05 07:25:20.133241+00	\N
3703	27	19	4	YELLOW BRIGHT	H&M	25-307	\N	t	\N	2026-01-05 07:25:20.142115+00	\N
3704	27	19	4	YELLOW BRIGHT	H&M	25-306	\N	t	\N	2026-01-05 07:25:20.151157+00	\N
3705	27	19	5	YELLOW MEDIUM	H&M	25-305	\N	t	\N	2026-01-05 07:25:20.161302+00	\N
3706	27	19	4	YELLOW BRIGHT	H&M	25-302	\N	t	\N	2026-01-05 07:25:20.169818+00	\N
3707	27	19	4	YELLOW BRIGHT	H&M	25-301	\N	t	\N	2026-01-05 07:25:20.181722+00	\N
3708	27	19	5	YELLOW MEDIUM	H&M	25-218	\N	t	\N	2026-01-05 07:25:20.190001+00	\N
3709	27	19	1	YELLOW MEDIUM DUSTY	H&M	25-217	\N	t	\N	2026-01-05 07:25:20.200328+00	\N
3710	27	19	5	YELLOW MEDIUM	H&M	25-216	\N	t	\N	2026-01-05 07:25:20.210073+00	\N
3711	27	19	5	YELLOW MEDIUM	H&M	25-215	\N	t	\N	2026-01-05 07:25:20.219007+00	\N
3712	27	19	1	YELLOW MEDIUM DUSTY	H&M	25-214	\N	t	\N	2026-01-05 07:25:20.229543+00	\N
3713	27	19	5	YELLOW MEDIUM	H&M	25-213	\N	t	\N	2026-01-05 07:25:20.237021+00	\N
3714	27	19	1	YELLOW MEDIUM DUSTY	H&M	25-212	\N	t	\N	2026-01-05 07:25:20.255778+00	\N
3715	27	19	5	YELLOW MEDIUM	H&M	25-211	\N	t	\N	2026-01-05 07:25:20.268511+00	\N
3716	27	19	5	YELLOW MEDIUM	H&M	25-210	\N	t	\N	2026-01-05 07:25:20.277071+00	\N
3717	27	19	5	YELLOW MEDIUM	H&M	25-209	\N	t	\N	2026-01-05 07:25:20.28477+00	\N
3718	27	19	5	YELLOW MEDIUM	H&M	25-208	\N	t	\N	2026-01-05 07:25:20.293404+00	\N
3719	27	19	5	YELLOW MEDIUM	H&M	25-207	\N	t	\N	2026-01-05 07:25:20.300848+00	\N
3720	27	19	5	YELLOW MEDIUM	H&M	25-206	\N	t	\N	2026-01-05 07:25:20.308717+00	\N
3721	27	19	5	YELLOW MEDIUM	H&M	25-205	\N	t	\N	2026-01-05 07:25:20.316929+00	\N
3722	27	19	5	YELLOW MEDIUM	H&M	25-204	\N	t	\N	2026-01-05 07:25:20.323947+00	\N
3723	27	19	5	YELLOW MEDIUM	H&M	25-203	\N	t	\N	2026-01-05 07:25:20.333459+00	\N
3724	27	19	1	YELLOW MEDIUM DUSTY	H&M	25-202	\N	t	\N	2026-01-05 07:25:20.340352+00	\N
3725	27	19	1	YELLOW MEDIUM DUSTY	H&M	25-201	\N	t	\N	2026-01-05 07:25:20.350978+00	\N
3726	27	19	1	YELLOW MEDIUM DUSTY	H&M	25-107	\N	t	\N	2026-01-05 07:25:20.360658+00	\N
3727	27	19	1	YELLOW MEDIUM DUSTY	H&M	25-106	\N	t	\N	2026-01-05 07:25:20.368349+00	\N
3728	27	19	3	YELLOW DUSTY LIGHT	H&M	25-105	\N	t	\N	2026-01-05 07:25:20.37681+00	\N
3729	27	19	3	YELLOW DUSTY LIGHT	H&M	25-104	\N	t	\N	2026-01-05 07:25:20.38424+00	\N
3730	27	19	3	YELLOW DUSTY LIGHT	H&M	25-103	\N	t	\N	2026-01-05 07:25:20.393289+00	\N
3731	27	19	3	YELLOW DUSTY LIGHT	H&M	25-101	\N	t	\N	2026-01-05 07:25:20.400842+00	\N
3732	27	19	4	YELLOW BRIGHT	H&M	24-324	\N	t	\N	2026-01-05 07:25:20.411042+00	\N
3733	27	19	5	YELLOW MEDIUM	H&M	24-323	\N	t	\N	2026-01-05 07:25:20.419857+00	\N
3734	27	19	4	YELLOW BRIGHT	H&M	24-322	\N	t	\N	2026-01-05 07:25:20.429572+00	\N
3735	27	19	4	YELLOW BRIGHT	H&M	24-321	\N	t	\N	2026-01-05 07:25:20.436585+00	\N
3736	27	19	5	YELLOW MEDIUM	H&M	24-320	\N	t	\N	2026-01-05 07:25:20.446045+00	\N
3737	27	19	4	YELLOW BRIGHT	H&M	24-319	\N	t	\N	2026-01-05 07:25:20.453012+00	\N
3738	27	19	5	YELLOW MEDIUM	H&M	24-318	\N	t	\N	2026-01-05 07:25:20.461346+00	\N
3739	27	19	5	YELLOW MEDIUM	H&M	24-317	\N	t	\N	2026-01-05 07:25:20.468804+00	\N
3740	27	19	5	YELLOW MEDIUM	H&M	24-316	\N	t	\N	2026-01-05 07:25:20.477668+00	\N
3741	27	19	4	YELLOW BRIGHT	H&M	24-315	\N	t	\N	2026-01-05 07:25:20.485292+00	\N
3742	27	19	4	YELLOW BRIGHT	H&M	24-314	\N	t	\N	2026-01-05 07:25:20.493743+00	\N
3743	27	19	6	YELLOW LIGHT	H&M	24-313	\N	t	\N	2026-01-05 07:25:20.501294+00	\N
3744	27	19	4	YELLOW BRIGHT	H&M	24-312	\N	t	\N	2026-01-05 07:25:20.510171+00	\N
3745	27	19	6	YELLOW LIGHT	H&M	24-311	\N	t	\N	2026-01-05 07:25:20.517764+00	\N
3746	27	19	5	YELLOW MEDIUM	H&M	24-310	\N	t	\N	2026-01-05 07:25:20.527288+00	\N
3747	27	19	4	YELLOW BRIGHT	H&M	24-309	\N	t	\N	2026-01-05 07:25:20.535581+00	\N
3748	27	19	4	YELLOW BRIGHT	H&M	24-308	\N	t	\N	2026-01-05 07:25:20.544527+00	\N
3749	27	19	5	YELLOW MEDIUM	H&M	24-307	\N	t	\N	2026-01-05 07:25:20.551989+00	\N
3750	27	19	4	YELLOW BRIGHT	H&M	24-306	\N	t	\N	2026-01-05 07:25:20.56095+00	\N
3751	27	19	4	YELLOW BRIGHT	H&M	24-305	\N	t	\N	2026-01-05 07:25:20.568574+00	\N
3752	27	19	5	YELLOW MEDIUM	H&M	24-304	\N	t	\N	2026-01-05 07:25:20.577005+00	\N
3753	27	19	6	YELLOW LIGHT	H&M	24-303	\N	t	\N	2026-01-05 07:25:20.584727+00	\N
3754	27	19	4	YELLOW BRIGHT	H&M	24-302	\N	t	\N	2026-01-05 07:25:20.59339+00	\N
3755	27	19	6	YELLOW LIGHT	H&M	24-301	\N	t	\N	2026-01-05 07:25:20.600894+00	\N
3756	27	19	6	YELLOW LIGHT	H&M	24-221	\N	t	\N	2026-01-05 07:25:20.609581+00	\N
3757	27	19	6	YELLOW LIGHT	H&M	24-220	\N	t	\N	2026-01-05 07:25:20.617388+00	\N
3758	27	19	6	YELLOW LIGHT	H&M	24-219	\N	t	\N	2026-01-05 07:25:20.626172+00	\N
3759	27	19	5	YELLOW MEDIUM	H&M	24-218	\N	t	\N	2026-01-05 07:25:20.633842+00	\N
3760	27	19	6	YELLOW LIGHT	H&M	24-217	\N	t	\N	2026-01-05 07:25:20.643+00	\N
3761	27	19	6	YELLOW LIGHT	H&M	24-216	\N	t	\N	2026-01-05 07:25:20.650548+00	\N
3762	27	19	6	YELLOW LIGHT	H&M	24-215	\N	t	\N	2026-01-05 07:25:20.658503+00	\N
3763	27	19	6	YELLOW LIGHT	H&M	24-214	\N	t	\N	2026-01-05 07:25:20.666665+00	\N
3764	27	19	6	YELLOW LIGHT	H&M	24-213	\N	t	\N	2026-01-05 07:25:20.674381+00	\N
3765	27	19	6	YELLOW LIGHT	H&M	24-212	\N	t	\N	2026-01-05 07:25:20.683102+00	\N
3766	27	19	6	YELLOW LIGHT	H&M	24-211	\N	t	\N	2026-01-05 07:25:20.68998+00	\N
3767	27	19	6	YELLOW LIGHT	H&M	24-210	\N	t	\N	2026-01-05 07:25:20.700467+00	\N
3768	27	19	6	YELLOW LIGHT	H&M	24-209	\N	t	\N	2026-01-05 07:25:20.709503+00	\N
3769	27	19	6	YELLOW LIGHT	H&M	24-208	\N	t	\N	2026-01-05 07:25:20.717337+00	\N
3770	27	19	6	YELLOW LIGHT	H&M	24-207	\N	t	\N	2026-01-05 07:25:20.725384+00	\N
3771	27	19	3	YELLOW DUSTY LIGHT	H&M	24-206	\N	t	\N	2026-01-05 07:25:20.733131+00	\N
3772	27	19	6	YELLOW LIGHT	H&M	24-205	\N	t	\N	2026-01-05 07:25:20.740438+00	\N
3773	27	19	3	YELLOW DUSTY LIGHT	H&M	24-204	\N	t	\N	2026-01-05 07:25:20.749575+00	\N
3774	27	19	6	YELLOW LIGHT	H&M	24-203	\N	t	\N	2026-01-05 07:25:20.75651+00	\N
3775	27	19	6	YELLOW LIGHT	H&M	24-202	\N	t	\N	2026-01-05 07:25:20.766282+00	\N
3776	27	19	3	YELLOW DUSTY LIGHT	H&M	24-120	\N	t	\N	2026-01-05 07:25:20.77314+00	\N
3777	27	19	6	YELLOW LIGHT	H&M	24-119	\N	t	\N	2026-01-05 07:25:20.782663+00	\N
3778	27	19	3	YELLOW DUSTY LIGHT	H&M	24-118	\N	t	\N	2026-01-05 07:25:20.789092+00	\N
3779	27	19	3	YELLOW DUSTY LIGHT	H&M	24-117	\N	t	\N	2026-01-05 07:25:20.799134+00	\N
3780	27	19	3	YELLOW DUSTY LIGHT	H&M	24-116	\N	t	\N	2026-01-05 07:25:20.805686+00	\N
3781	27	19	3	YELLOW DUSTY LIGHT	H&M	24-115	\N	t	\N	2026-01-05 07:25:20.815469+00	\N
3782	27	19	3	YELLOW DUSTY LIGHT	H&M	24-113	\N	t	\N	2026-01-05 07:25:20.82217+00	\N
3783	27	19	3	YELLOW DUSTY LIGHT	H&M	24-112	\N	t	\N	2026-01-05 07:25:20.831433+00	\N
3784	27	19	3	YELLOW DUSTY LIGHT	H&M	24-111	\N	t	\N	2026-01-05 07:25:20.838325+00	\N
3785	27	19	3	YELLOW DUSTY LIGHT	H&M	24-110	\N	t	\N	2026-01-05 07:25:20.847976+00	\N
3786	27	19	3	YELLOW DUSTY LIGHT	H&M	24-109	\N	t	\N	2026-01-05 07:25:20.854865+00	\N
3787	27	19	6	YELLOW LIGHT	H&M	24-108	\N	t	\N	2026-01-05 07:25:20.865803+00	\N
3788	27	19	6	YELLOW LIGHT	H&M	24-107	\N	t	\N	2026-01-05 07:25:20.87273+00	\N
3789	27	19	6	YELLOW LIGHT	H&M	24-106	\N	t	\N	2026-01-05 07:25:20.883455+00	\N
3790	27	19	3	YELLOW DUSTY LIGHT	H&M	24-104	\N	t	\N	2026-01-05 07:25:20.892484+00	\N
3791	27	19	6	YELLOW LIGHT	H&M	24-102	\N	t	\N	2026-01-05 07:25:20.899958+00	\N
3792	27	19	3	YELLOW DUSTY LIGHT	H&M	24-101	\N	t	\N	2026-01-05 07:25:20.907688+00	\N
3793	27	19	5	YELLOW MEDIUM	H&M	23-314	\N	t	\N	2026-01-05 07:25:20.916439+00	\N
3794	27	19	2	YELLOW DARK	H&M	23-304	\N	t	\N	2026-01-05 07:25:20.924114+00	\N
3795	27	19	1	YELLOW MEDIUM DUSTY	H&M	23-206	\N	t	\N	2026-01-05 07:25:20.932704+00	\N
3796	27	19	2	YELLOW DARK	H&M	23-203	\N	t	\N	2026-01-05 07:25:20.939135+00	\N
3797	27	19	5	YELLOW MEDIUM	H&M	22-317	\N	t	\N	2026-01-05 07:25:20.949065+00	\N
3798	27	19	4	YELLOW BRIGHT	H&M	22-316	\N	t	\N	2026-01-05 07:25:20.956147+00	\N
3799	27	19	2	YELLOW DARK	H&M	22-315	\N	t	\N	2026-01-05 07:25:20.966277+00	\N
3800	27	19	5	YELLOW MEDIUM	H&M	22-313	\N	t	\N	2026-01-05 07:25:20.973268+00	\N
3801	27	19	2	YELLOW DARK	H&M	22-312	\N	t	\N	2026-01-05 07:25:20.982815+00	\N
3802	27	19	4	YELLOW BRIGHT	H&M	22-311	\N	t	\N	2026-01-05 07:25:20.990357+00	\N
3803	27	19	5	YELLOW MEDIUM	H&M	22-310	\N	t	\N	2026-01-05 07:25:21.000435+00	\N
3804	27	19	4	YELLOW BRIGHT	H&M	22-308	\N	t	\N	2026-01-05 07:25:21.009261+00	\N
3805	27	19	5	YELLOW MEDIUM	H&M	22-307	\N	t	\N	2026-01-05 07:25:21.017059+00	\N
3806	27	19	5	YELLOW MEDIUM	H&M	22-306	\N	t	\N	2026-01-05 07:25:21.026493+00	\N
3807	27	19	5	YELLOW MEDIUM	H&M	22-305	\N	t	\N	2026-01-05 07:25:21.034929+00	\N
3808	27	19	5	YELLOW MEDIUM	H&M	22-303	\N	t	\N	2026-01-05 07:25:21.046916+00	\N
3809	27	19	5	YELLOW MEDIUM	H&M	22-302	\N	t	\N	2026-01-05 07:25:21.054385+00	\N
3810	27	19	5	YELLOW MEDIUM	H&M	22-301	\N	t	\N	2026-01-05 07:25:21.065181+00	\N
3811	27	19	1	YELLOW MEDIUM DUSTY	H&M	22-220	\N	t	\N	2026-01-05 07:25:21.073027+00	\N
3812	27	19	3	YELLOW DUSTY LIGHT	H&M	22-219	\N	t	\N	2026-01-05 07:25:21.083199+00	\N
3813	27	19	3	YELLOW DUSTY LIGHT	H&M	22-212	\N	t	\N	2026-01-05 07:25:21.090402+00	\N
3814	27	19	1	YELLOW MEDIUM DUSTY	H&M	22-208	\N	t	\N	2026-01-05 07:25:21.098943+00	\N
3815	27	19	1	YELLOW MEDIUM DUSTY	H&M	22-207	\N	t	\N	2026-01-05 07:25:21.106155+00	\N
3816	27	19	6	YELLOW LIGHT	H&M	22-206	\N	t	\N	2026-01-05 07:25:21.115613+00	\N
3817	27	19	5	YELLOW MEDIUM	H&M	22-205	\N	t	\N	2026-01-05 07:25:21.12242+00	\N
3818	27	19	3	YELLOW DUSTY LIGHT	H&M	22-204	\N	t	\N	2026-01-05 07:25:21.132671+00	\N
3819	27	19	3	YELLOW DUSTY LIGHT	H&M	22-203	\N	t	\N	2026-01-05 07:25:21.13945+00	\N
3820	27	19	2	YELLOW DARK	H&M	22-202	\N	t	\N	2026-01-05 07:25:21.149373+00	\N
3821	27	19	3	YELLOW DUSTY LIGHT	H&M	22-105	\N	t	\N	2026-01-05 07:25:21.156092+00	\N
3822	27	19	4	YELLOW BRIGHT	H&M	21-316	\N	t	\N	2026-01-05 07:25:21.165696+00	\N
3823	27	19	4	YELLOW BRIGHT	H&M	21-315	\N	t	\N	2026-01-05 07:25:21.172346+00	\N
3824	27	19	4	YELLOW BRIGHT	H&M	21-314	\N	t	\N	2026-01-05 07:25:21.182616+00	\N
3825	27	19	4	YELLOW BRIGHT	H&M	21-313	\N	t	\N	2026-01-05 07:25:21.189883+00	\N
3826	27	19	6	YELLOW LIGHT	H&M	21-312	\N	t	\N	2026-01-05 07:25:21.201562+00	\N
3827	27	19	6	YELLOW LIGHT	H&M	21-311	\N	t	\N	2026-01-05 07:25:21.213196+00	\N
3828	27	19	5	YELLOW MEDIUM	H&M	21-310	\N	t	\N	2026-01-05 07:25:21.221372+00	\N
3829	27	19	4	YELLOW BRIGHT	H&M	21-309	\N	t	\N	2026-01-05 07:25:21.232646+00	\N
3830	27	19	4	YELLOW BRIGHT	H&M	21-308	\N	t	\N	2026-01-05 07:25:21.242094+00	\N
3831	27	19	6	YELLOW LIGHT	H&M	21-307	\N	t	\N	2026-01-05 07:25:21.250375+00	\N
3832	27	19	6	YELLOW LIGHT	H&M	21-306	\N	t	\N	2026-01-05 07:25:21.259708+00	\N
3833	27	19	6	YELLOW LIGHT	H&M	21-305	\N	t	\N	2026-01-05 07:25:21.268511+00	\N
3834	27	19	6	YELLOW LIGHT	H&M	21-303	\N	t	\N	2026-01-05 07:25:21.280219+00	\N
3835	27	19	6	YELLOW LIGHT	H&M	21-218	\N	t	\N	2026-01-05 07:25:21.286996+00	\N
3836	27	19	6	YELLOW LIGHT	H&M	21-217	\N	t	\N	2026-01-05 07:25:21.296239+00	\N
3837	27	19	6	YELLOW LIGHT	H&M	21-216	\N	t	\N	2026-01-05 07:25:21.30299+00	\N
3838	27	19	3	YELLOW DUSTY LIGHT	H&M	21-215	\N	t	\N	2026-01-05 07:25:21.312221+00	\N
3839	27	19	6	YELLOW LIGHT	H&M	21-213	\N	t	\N	2026-01-05 07:25:21.319289+00	\N
3840	27	19	6	YELLOW LIGHT	H&M	21-212	\N	t	\N	2026-01-05 07:25:21.328493+00	\N
3841	27	19	6	YELLOW LIGHT	H&M	21-211	\N	t	\N	2026-01-05 07:25:21.335689+00	\N
3842	27	19	6	YELLOW LIGHT	H&M	21-210	\N	t	\N	2026-01-05 07:25:21.3452+00	\N
3843	27	19	6	YELLOW LIGHT	H&M	21-209	\N	t	\N	2026-01-05 07:25:21.352447+00	\N
3844	27	19	6	YELLOW LIGHT	H&M	21-208	\N	t	\N	2026-01-05 07:25:21.36177+00	\N
3845	27	19	6	YELLOW LIGHT	H&M	21-206	\N	t	\N	2026-01-05 07:25:21.368908+00	\N
3846	27	19	3	YELLOW DUSTY LIGHT	H&M	21-205	\N	t	\N	2026-01-05 07:25:21.378217+00	\N
3847	27	19	6	YELLOW LIGHT	H&M	21-202	\N	t	\N	2026-01-05 07:25:21.385457+00	\N
3848	27	19	6	YELLOW LIGHT	H&M	21-201	\N	t	\N	2026-01-05 07:25:21.395159+00	\N
3849	27	19	3	YELLOW DUSTY LIGHT	H&M	21-105	\N	t	\N	2026-01-05 07:25:21.402525+00	\N
3850	27	19	3	YELLOW DUSTY LIGHT	H&M	21-104	\N	t	\N	2026-01-05 07:25:21.412373+00	\N
3851	27	19	3	YELLOW DUSTY LIGHT	H&M	21-103	\N	t	\N	2026-01-05 07:25:21.419514+00	\N
3852	27	19	6	YELLOW LIGHT	H&M	21-102	\N	t	\N	2026-01-05 07:25:21.429112+00	\N
3853	27	19	3	YELLOW DUSTY LIGHT	H&M	21-101	\N	t	\N	2026-01-05 07:25:21.43579+00	\N
3854	27	19	4	YELLOW BRIGHT	H&M	20-319	\N	t	\N	2026-01-05 07:25:21.444952+00	\N
3855	27	19	4	YELLOW BRIGHT	H&M	20-107	\N	t	\N	2026-01-05 07:25:21.451991+00	\N
3856	27	19	4	YELLOW BRIGHT	H&M	20-106	\N	t	\N	2026-01-05 07:25:21.459917+00	\N
3857	27	19	4	YELLOW BRIGHT	H&M	20-105	\N	t	\N	2026-01-05 07:25:21.46705+00	\N
3858	27	19	4	YELLOW BRIGHT	H&M	20-104	\N	t	\N	2026-01-05 07:25:21.476103+00	\N
3859	27	19	4	YELLOW BRIGHT	H&M	20-103	\N	t	\N	2026-01-05 07:25:21.483689+00	\N
3860	27	19	4	YELLOW BRIGHT	H&M	20-102	\N	t	\N	2026-01-05 07:25:21.492001+00	\N
3861	27	19	6	YELLOW LIGHT	H&M	20-101	\N	t	\N	2026-01-05 07:25:21.499724+00	\N
3862	27	19	3	YELLOW DUSTY LIGHT	H&M	12-136	\N	t	\N	2026-01-05 07:25:21.507888+00	\N
3863	27	19	3	YELLOW DUSTY LIGHT	H&M	12-128	\N	t	\N	2026-01-05 07:25:21.515927+00	\N
3864	15	8	2	BROWN DARK	H&M	17-229	\N	t	\N	2026-01-05 07:25:21.523976+00	\N
\.


--
-- Data for Name: color_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.color_value (id, color_value_code, color_value_code_type, sort_order, is_active, created_at, updated_at) FROM stdin;
1	MEDIUM DUSTY	H&M	0	t	2026-01-05 07:08:52.962742+00	\N
2	DARK	H&M	0	t	2026-01-05 07:08:53.02554+00	\N
3	DUSTY LIGHT	H&M	0	t	2026-01-05 07:08:53.070855+00	\N
4	BRIGHT	H&M	0	t	2026-01-05 07:08:53.100135+00	\N
5	MEDIUM	H&M	0	t	2026-01-05 07:08:53.125345+00	\N
6	LIGHT	H&M	0	t	2026-01-05 07:08:53.163081+00	\N
7	UNDEFINED	H&M	0	t	2026-01-05 07:10:59.965407+00	\N
\.


--
-- Data for Name: company_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_profile (id, company_name, legal_name, registration_number, tax_id, logo_url, website, email, phone, fax, address_line1, address_line2, city, state, country, postal_code, default_currency_id, fiscal_year_start_month, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: country; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.country (id, country_id, country_name, international_country_code, international_dialing_number, currency_code, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: currencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.currencies (id, currency_code, currency_name, symbol, decimal_places, is_base_currency, exchange_rate, rate_updated_at, is_active, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, department_code, department_name, parent_department_id, branch_id, manager_user_id, cost_center_code, is_active, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_numbering; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_numbering (id, document_type, document_name, prefix, suffix, current_number, number_length, fiscal_year_reset, branch_wise, sample_format, is_active, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fiscal_year; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fiscal_year (id, fiscal_year_code, fiscal_year_name, start_date, end_date, is_current, is_closed, closed_date, closed_by_user_id, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: per_minute_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.per_minute_value (id, date_of_value_set, value, currency_id, amendment_no, effective_from, effective_to, is_current, approved_by_user_id, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, permission_code, permission_name, module, action, description, created_at) FROM stdin;
\.


--
-- Data for Name: port; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.port (id, country_id, city_id, locode, port_name, name_wo_diacritics, subdivision, function, status, date, iata, coordinates, remarks, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, role_id, permission_id, created_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, role_code, role_name, description, is_system_role, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: taxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.taxes (id, tax_code, tax_name, tax_type, rate, is_compound, is_recoverable, account_id, is_active, effective_from, effective_to, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: uom; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.uom (id, category_id, name, symbol, factor, is_base, is_active, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: uom_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.uom_category (id, uom_category, uom_id, uom_name, uom_description, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouses (id, warehouse_code, warehouse_name, warehouse_type, branch_id, address_line1, address_line2, city, country, manager_name, capacity_sqft, is_default, is_active, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branches_id_seq', 1, false);


--
-- Name: chart_of_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chart_of_accounts_id_seq', 1, false);


--
-- Name: city_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.city_id_seq', 1, false);


--
-- Name: color_family_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.color_family_id_seq', 20, true);


--
-- Name: color_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.color_id_seq', 28, true);


--
-- Name: color_master_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.color_master_id_seq', 3864, true);


--
-- Name: color_value_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.color_value_id_seq', 7, true);


--
-- Name: company_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_profile_id_seq', 1, false);


--
-- Name: country_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.country_id_seq', 1, false);


--
-- Name: currencies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.currencies_id_seq', 1, false);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 1, false);


--
-- Name: document_numbering_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.document_numbering_id_seq', 1, false);


--
-- Name: fiscal_year_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fiscal_year_id_seq', 1, false);


--
-- Name: per_minute_value_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.per_minute_value_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 1, false);


--
-- Name: port_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.port_id_seq', 1, false);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: taxes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.taxes_id_seq', 1, false);


--
-- Name: uom_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.uom_category_id_seq', 1, false);


--
-- Name: uom_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.uom_id_seq', 1, false);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 1, false);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: chart_of_accounts chart_of_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id);


--
-- Name: city city_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city
    ADD CONSTRAINT city_pkey PRIMARY KEY (id);


--
-- Name: color_family color_family_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_family
    ADD CONSTRAINT color_family_pkey PRIMARY KEY (id);


--
-- Name: color_master color_master_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_master
    ADD CONSTRAINT color_master_pkey PRIMARY KEY (id);


--
-- Name: color color_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color
    ADD CONSTRAINT color_pkey PRIMARY KEY (id);


--
-- Name: color_value color_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_value
    ADD CONSTRAINT color_value_pkey PRIMARY KEY (id);


--
-- Name: company_profile company_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_profile
    ADD CONSTRAINT company_profile_pkey PRIMARY KEY (id);


--
-- Name: country country_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.country
    ADD CONSTRAINT country_pkey PRIMARY KEY (id);


--
-- Name: currencies currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currencies
    ADD CONSTRAINT currencies_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: document_numbering document_numbering_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_numbering
    ADD CONSTRAINT document_numbering_pkey PRIMARY KEY (id);


--
-- Name: fiscal_year fiscal_year_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiscal_year
    ADD CONSTRAINT fiscal_year_pkey PRIMARY KEY (id);


--
-- Name: per_minute_value per_minute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.per_minute_value
    ADD CONSTRAINT per_minute_value_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: port port_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.port
    ADD CONSTRAINT port_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: taxes taxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_pkey PRIMARY KEY (id);


--
-- Name: uom_category uom_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uom_category
    ADD CONSTRAINT uom_category_pkey PRIMARY KEY (id);


--
-- Name: uom uom_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uom
    ADD CONSTRAINT uom_pkey PRIMARY KEY (id);


--
-- Name: color_master uq_color_code_type; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_master
    ADD CONSTRAINT uq_color_code_type UNIQUE (color_code, color_code_type);


--
-- Name: color uq_color_family; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color
    ADD CONSTRAINT uq_color_family UNIQUE (color, color_family_id);


--
-- Name: role_permissions uq_role_permission; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id);


--
-- Name: uom uq_uom_category_symbol; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uom
    ADD CONSTRAINT uq_uom_category_symbol UNIQUE (category_id, symbol);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: ix_branches_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_branches_branch_code ON public.branches USING btree (branch_code);


--
-- Name: ix_branches_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_branches_id ON public.branches USING btree (id);


--
-- Name: ix_chart_of_accounts_account_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_chart_of_accounts_account_code ON public.chart_of_accounts USING btree (account_code);


--
-- Name: ix_chart_of_accounts_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_chart_of_accounts_id ON public.chart_of_accounts USING btree (id);


--
-- Name: ix_city_city_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_city_city_id ON public.city USING btree (city_id);


--
-- Name: ix_city_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_city_id ON public.city USING btree (id);


--
-- Name: ix_color_family_color_family; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_color_family_color_family ON public.color_family USING btree (color_family);


--
-- Name: ix_color_family_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_color_family_id ON public.color_family USING btree (id);


--
-- Name: ix_color_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_color_id ON public.color USING btree (id);


--
-- Name: ix_color_master_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_color_master_id ON public.color_master USING btree (id);


--
-- Name: ix_color_value_color_value_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_color_value_color_value_code ON public.color_value USING btree (color_value_code);


--
-- Name: ix_color_value_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_color_value_id ON public.color_value USING btree (id);


--
-- Name: ix_company_profile_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_company_profile_id ON public.company_profile USING btree (id);


--
-- Name: ix_country_country_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_country_country_id ON public.country USING btree (country_id);


--
-- Name: ix_country_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_country_id ON public.country USING btree (id);


--
-- Name: ix_currencies_currency_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_currencies_currency_code ON public.currencies USING btree (currency_code);


--
-- Name: ix_currencies_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_currencies_id ON public.currencies USING btree (id);


--
-- Name: ix_departments_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_departments_department_code ON public.departments USING btree (department_code);


--
-- Name: ix_departments_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_departments_id ON public.departments USING btree (id);


--
-- Name: ix_document_numbering_document_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_document_numbering_document_type ON public.document_numbering USING btree (document_type);


--
-- Name: ix_document_numbering_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_document_numbering_id ON public.document_numbering USING btree (id);


--
-- Name: ix_fiscal_year_fiscal_year_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_fiscal_year_fiscal_year_code ON public.fiscal_year USING btree (fiscal_year_code);


--
-- Name: ix_fiscal_year_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_fiscal_year_id ON public.fiscal_year USING btree (id);


--
-- Name: ix_per_minute_value_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_per_minute_value_id ON public.per_minute_value USING btree (id);


--
-- Name: ix_permissions_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_permissions_id ON public.permissions USING btree (id);


--
-- Name: ix_permissions_permission_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_permissions_permission_code ON public.permissions USING btree (permission_code);


--
-- Name: ix_port_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_port_id ON public.port USING btree (id);


--
-- Name: ix_port_locode; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_port_locode ON public.port USING btree (locode);


--
-- Name: ix_role_permissions_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_role_permissions_id ON public.role_permissions USING btree (id);


--
-- Name: ix_roles_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_roles_id ON public.roles USING btree (id);


--
-- Name: ix_roles_role_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_roles_role_code ON public.roles USING btree (role_code);


--
-- Name: ix_taxes_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_taxes_id ON public.taxes USING btree (id);


--
-- Name: ix_taxes_tax_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_taxes_tax_code ON public.taxes USING btree (tax_code);


--
-- Name: ix_uom_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_uom_category_id ON public.uom_category USING btree (id);


--
-- Name: ix_uom_category_uom_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_uom_category_uom_category ON public.uom_category USING btree (uom_category);


--
-- Name: ix_uom_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_uom_id ON public.uom USING btree (id);


--
-- Name: ix_warehouses_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_warehouses_id ON public.warehouses USING btree (id);


--
-- Name: ix_warehouses_warehouse_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_warehouses_warehouse_code ON public.warehouses USING btree (warehouse_code);


--
-- Name: chart_of_accounts chart_of_accounts_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currencies(id);


--
-- Name: chart_of_accounts chart_of_accounts_parent_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_parent_account_id_fkey FOREIGN KEY (parent_account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: city city_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city
    ADD CONSTRAINT city_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.country(id) ON DELETE RESTRICT;


--
-- Name: color color_color_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color
    ADD CONSTRAINT color_color_family_id_fkey FOREIGN KEY (color_family_id) REFERENCES public.color_family(id) ON DELETE RESTRICT;


--
-- Name: color_master color_master_color_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_master
    ADD CONSTRAINT color_master_color_family_id_fkey FOREIGN KEY (color_family_id) REFERENCES public.color_family(id) ON DELETE RESTRICT;


--
-- Name: color_master color_master_color_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_master
    ADD CONSTRAINT color_master_color_id_fkey FOREIGN KEY (color_id) REFERENCES public.color(id) ON DELETE RESTRICT;


--
-- Name: color_master color_master_color_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_master
    ADD CONSTRAINT color_master_color_value_id_fkey FOREIGN KEY (color_value_id) REFERENCES public.color_value(id);


--
-- Name: departments departments_parent_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_parent_department_id_fkey FOREIGN KEY (parent_department_id) REFERENCES public.departments(id);


--
-- Name: port port_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.port
    ADD CONSTRAINT port_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.city(id);


--
-- Name: port port_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.port
    ADD CONSTRAINT port_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.country(id) ON DELETE RESTRICT;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: taxes taxes_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: uom uom_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uom
    ADD CONSTRAINT uom_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.uom_category(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict wXj1Zy5s857iufXrthvmtCSeCeJNNFH25iD3WGxtHPZERbZ9YKkbphcPWfivyDx

