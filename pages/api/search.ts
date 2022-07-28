import { Client } from "@elastic/elasticsearch";
import type { NextApiRequest, NextApiResponse } from "next";

// Return data from elasticsearch
const search = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const { query } = req.query;
    const client = new Client({
        node: "http://10.16.77.120:9200",
    });
    // @ts-ignore
    const r = await client.search({
            index: "designer_document@6cad15510e89dd01c74cf782bc7b733f@nn_repository__batch_templates_," +
                "designer_activecontent@6cad15510e89dd01c74cf782bc7b733f@nn_repository__batch_templates_," +
                "designer_dataalias@6cad15510e89dd01c74cf782bc7b733f@nn_repository__batch_templates_," +
                "designer_datafield@6cad15510e89dd01c74cf782bc7b733f@nn_repository__batch_templates_," +
                "designer_document@6cad15510e89dd01c74cf782bc7b733f@nn_repository__batch_templates_," +
                "designer_font@6cad15510e89dd01c74cf782bc7b733f@nn_repository__batch_templates_," +
                "designer_image@6cad15510e89dd01c74cf782bc7b733f@nn_repository__batch_templates_," +
                "designer_interactivevariable@6cad15510e89dd01c74cf782bc7b733f@nn_repository__batch_templates_," +
                "designer_publication@6cad15510e89dd01c74cf782bc7b733f@nn_repository__batch_templates_," +
                "designer_variable@6cad15510e89dd01c74cf782bc7b733f@nn_repository__batch_templates_",
            size: 5000,
            body: {
                "query": {
                    "nested": {
                        "query": {
                            "bool": {
                                "must": [
                                    {
                                        "match": {
                                            "paragraphs.text_content": {
                                                "query": query,
                                                "operator": "OR",
                                                "prefix_length": 0,
                                                "max_expansions": 50,
                                                "fuzzy_transpositions": true,
                                                "lenient": false,
                                                "zero_terms_query": "NONE",
                                                "auto_generate_synonyms_phrase_query": true,
                                                "boost": 1.0
                                            }
                                        }
                                    }
                                ],
                                "should": [
                                    {
                                        "match_phrase": {
                                            "paragraphs.text_content": {
                                                "query": query,
                                                "slop": 0,
                                                "zero_terms_query": "NONE",
                                                "boost": 10.0
                                            }
                                        }
                                    }
                                ],
                                "adjust_pure_negative": true,
                                "boost": 1.0
                            }
                        },
                        "path": "paragraphs",
                        "ignore_unmapped": true,
                        "score_mode": "avg",
                        "boost": 1.0,
                        "inner_hits": {
                            "ignore_unmapped": true,
                            "from": 0,
                            "size": 100,
                            "version": false,
                            "seq_no_primary_term": false,
                            "explain": false,
                            "track_scores": false,
                            "highlight": {
                                "fields": {
                                    "paragraphs.text_content": {
                                        "pre_tags": [
                                            "\u0002"
                                        ],
                                        "post_tags": [
                                            "\u0003"
                                        ],
                                        "fragment_size": 64,
                                        "number_of_fragments": 100
                                    }
                                }
                            }
                        }
                    }
                },
                "_source": {
                    "includes": [],
                    "excludes": [
                        "references",
                        "paragraphs"
                    ]
                },
                "sort": [
                    {
                        "_score": {
                            "order": "desc"
                        }
                    },
                    {
                        "_doc": {
                            "order": "asc"
                        }
                    },
                    {
                        "asset_id": {
                            "order": "asc"
                        }
                    },
                    {
                        "label_id": {
                            "order": "asc"
                        }
                    }
                ]
            }
        }
    );
    const hits = r.hits;
    const response = hits.hits.map((hit: any) => ({
        _id: hit._id,
        ...hit._source,
        total_hits: hit.inner_hits.paragraphs.hits.total.value,
        inner_hits: hit.inner_hits.paragraphs.hits.hits
    }));
    return res
        .status(200)
        .json(
            {hits: response, total: hits.total}
        );
};

export default search;