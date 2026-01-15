--
-- PostgreSQL database dump
--

\restrict 0plKHdxtDKt3hJ80fBqLjKJGkzdwDPt1kJaUygq6yOdUIKko4jeC64xv01sLcXY

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
-- Name: order_management; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_management (
    id integer NOT NULL,
    order_no character varying NOT NULL,
    style_name character varying NOT NULL,
    season character varying,
    order_category character varying,
    sales_contract character varying,
    scl_po character varying,
    fob double precision,
    note text,
    buyer_id integer NOT NULL,
    style_id integer NOT NULL,
    product_category character varying,
    style_description text,
    gauge character varying,
    is_set boolean,
    order_quantity integer,
    unit_price double precision,
    total_value double precision,
    order_date timestamp with time zone,
    delivery_date timestamp with time zone,
    shipment_date timestamp with time zone,
    order_status character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.order_management OWNER TO postgres;

--
-- Name: order_management_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_management_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_management_id_seq OWNER TO postgres;

--
-- Name: order_management_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_management_id_seq OWNED BY public.order_management.id;


--
-- Name: order_management id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_management ALTER COLUMN id SET DEFAULT nextval('public.order_management_id_seq'::regclass);


--
-- Data for Name: order_management; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_management (id, order_no, style_name, season, order_category, sales_contract, scl_po, fob, note, buyer_id, style_id, product_category, style_description, gauge, is_set, order_quantity, unit_price, total_value, order_date, delivery_date, shipment_date, order_status, created_at, updated_at) FROM stdin;
\.


--
-- Name: order_management_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_management_id_seq', 1, false);


--
-- Name: order_management order_management_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_management
    ADD CONSTRAINT order_management_pkey PRIMARY KEY (id);


--
-- Name: ix_order_management_buyer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_order_management_buyer_id ON public.order_management USING btree (buyer_id);


--
-- Name: ix_order_management_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_order_management_id ON public.order_management USING btree (id);


--
-- Name: ix_order_management_order_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_order_management_order_no ON public.order_management USING btree (order_no);


--
-- Name: ix_order_management_style_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_order_management_style_id ON public.order_management USING btree (style_id);


--
-- PostgreSQL database dump complete
--

\unrestrict 0plKHdxtDKt3hJ80fBqLjKJGkzdwDPt1kJaUygq6yOdUIKko4jeC64xv01sLcXY

