--
-- PostgreSQL database dump
--

\restrict gSm6eQRi1RPOvsWBJDxE8DljnaKuV4tl31FOBgD6fyt7bFeyT1UUoneTt8HGQ9I

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
-- Name: banking_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banking_info (
    id integer NOT NULL,
    client_name character varying NOT NULL,
    country character varying,
    bank_name character varying NOT NULL,
    sort_code character varying,
    swift_code character varying,
    account_number character varying NOT NULL,
    currency character varying,
    account_type character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.banking_info OWNER TO postgres;

--
-- Name: banking_info_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banking_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.banking_info_id_seq OWNER TO postgres;

--
-- Name: banking_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banking_info_id_seq OWNED BY public.banking_info.id;


--
-- Name: buyers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buyers (
    id integer NOT NULL,
    buyer_name character varying NOT NULL,
    brand_name character varying,
    company_name character varying NOT NULL,
    head_office_country character varying,
    email character varying,
    phone character varying,
    website character varying,
    tax_id character varying,
    rating double precision,
    status character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.buyers OWNER TO postgres;

--
-- Name: buyers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.buyers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.buyers_id_seq OWNER TO postgres;

--
-- Name: buyers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.buyers_id_seq OWNED BY public.buyers.id;


--
-- Name: contact_persons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_persons (
    id integer NOT NULL,
    contact_person_name character varying NOT NULL,
    company character varying,
    department character varying,
    designation character varying,
    phone_number character varying,
    corporate_mail character varying,
    country character varying,
    buyer_id integer,
    supplier_id integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.contact_persons OWNER TO postgres;

--
-- Name: contact_persons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_persons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contact_persons_id_seq OWNER TO postgres;

--
-- Name: contact_persons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_persons_id_seq OWNED BY public.contact_persons.id;


--
-- Name: shipping_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_info (
    id integer NOT NULL,
    buyer_id integer NOT NULL,
    brand_name character varying,
    company_name character varying,
    destination_country character varying,
    destination_country_code character varying,
    destination_port character varying,
    place_of_delivery character varying,
    destination_code character varying,
    warehouse_no character varying,
    address text,
    incoterm character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.shipping_info OWNER TO postgres;

--
-- Name: shipping_info_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shipping_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.shipping_info_id_seq OWNER TO postgres;

--
-- Name: shipping_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shipping_info_id_seq OWNED BY public.shipping_info.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    supplier_name character varying NOT NULL,
    company_name character varying NOT NULL,
    supplier_type character varying,
    contact_person character varying,
    email character varying,
    phone character varying,
    country character varying,
    brand_name character varying,
    head_office_country character varying,
    website character varying,
    tax_id character varying,
    rating double precision,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.suppliers_id_seq OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: banking_info id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banking_info ALTER COLUMN id SET DEFAULT nextval('public.banking_info_id_seq'::regclass);


--
-- Name: buyers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buyers ALTER COLUMN id SET DEFAULT nextval('public.buyers_id_seq'::regclass);


--
-- Name: contact_persons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_persons ALTER COLUMN id SET DEFAULT nextval('public.contact_persons_id_seq'::regclass);


--
-- Name: shipping_info id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_info ALTER COLUMN id SET DEFAULT nextval('public.shipping_info_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Data for Name: banking_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banking_info (id, client_name, country, bank_name, sort_code, swift_code, account_number, currency, account_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: buyers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.buyers (id, buyer_name, brand_name, company_name, head_office_country, email, phone, website, tax_id, rating, status, created_at, updated_at) FROM stdin;
1	test	test	test		abc@gmail.com			\N	0	active	2026-01-05 03:48:31.187439+00	\N
\.


--
-- Data for Name: contact_persons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_persons (id, contact_person_name, company, department, designation, phone_number, corporate_mail, country, buyer_id, supplier_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: shipping_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_info (id, buyer_id, brand_name, company_name, destination_country, destination_country_code, destination_port, place_of_delivery, destination_code, warehouse_no, address, incoterm, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, supplier_name, company_name, supplier_type, contact_person, email, phone, country, brand_name, head_office_country, website, tax_id, rating, created_at, updated_at) FROM stdin;
\.


--
-- Name: banking_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banking_info_id_seq', 1, false);


--
-- Name: buyers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.buyers_id_seq', 1, true);


--
-- Name: contact_persons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_persons_id_seq', 1, false);


--
-- Name: shipping_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shipping_info_id_seq', 1, false);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, false);


--
-- Name: banking_info banking_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banking_info
    ADD CONSTRAINT banking_info_pkey PRIMARY KEY (id);


--
-- Name: buyers buyers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_pkey PRIMARY KEY (id);


--
-- Name: contact_persons contact_persons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_persons
    ADD CONSTRAINT contact_persons_pkey PRIMARY KEY (id);


--
-- Name: shipping_info shipping_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_info
    ADD CONSTRAINT shipping_info_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: ix_banking_info_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_banking_info_id ON public.banking_info USING btree (id);


--
-- Name: ix_buyers_buyer_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_buyers_buyer_name ON public.buyers USING btree (buyer_name);


--
-- Name: ix_buyers_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_buyers_id ON public.buyers USING btree (id);


--
-- Name: ix_contact_persons_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_contact_persons_id ON public.contact_persons USING btree (id);


--
-- Name: ix_shipping_info_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_shipping_info_id ON public.shipping_info USING btree (id);


--
-- Name: ix_suppliers_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_suppliers_id ON public.suppliers USING btree (id);


--
-- Name: ix_suppliers_supplier_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_suppliers_supplier_name ON public.suppliers USING btree (supplier_name);


--
-- Name: contact_persons contact_persons_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_persons
    ADD CONSTRAINT contact_persons_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.buyers(id);


--
-- Name: contact_persons contact_persons_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_persons
    ADD CONSTRAINT contact_persons_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: shipping_info shipping_info_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_info
    ADD CONSTRAINT shipping_info_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.buyers(id);


--
-- PostgreSQL database dump complete
--

\unrestrict gSm6eQRi1RPOvsWBJDxE8DljnaKuV4tl31FOBgD6fyt7bFeyT1UUoneTt8HGQ9I

