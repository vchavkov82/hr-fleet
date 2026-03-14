// Package docs HR Platform API.
//
// REST API for HR Platform with Bulgarian payroll
//
//	Schemes: http, https
//	Host: localhost:8080
//	BasePath: /api/v1
//	Version: 1.0
//
//	SecurityDefinitions:
//	  BearerAuth:
//	    type: apiKey
//	    in: header
//	    name: Authorization
//	  APIKeyAuth:
//	    type: apiKey
//	    in: header
//	    name: X-API-Key
//
// swagger:meta
package docs

import "github.com/swaggo/swag"

const docTemplate = `{
    "swagger": "2.0",
    "info": {
        "description": "REST API for HR Platform with Bulgarian payroll",
        "title": "HR Platform API",
        "version": "1.0"
    },
    "host": "localhost:8080",
    "basePath": "/api/v1",
    "securityDefinitions": {
        "BearerAuth": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header"
        },
        "APIKeyAuth": {
            "type": "apiKey",
            "name": "X-API-Key",
            "in": "header"
        }
    },
    "paths": {}
}`

// SwaggerInfo holds exported Swagger Info so clients can modify it.
var SwaggerInfo = &swag.Spec{
	Version:          "1.0",
	Host:             "localhost:8080",
	BasePath:         "/api/v1",
	Schemes:          []string{"http", "https"},
	Title:            "HR Platform API",
	Description:      "REST API for HR Platform with Bulgarian payroll",
	InfoInstanceName: "swagger",
	SwaggerTemplate:  docTemplate,
	LeftDelim:        "{{",
	RightDelim:       "}}",
}

func init() {
	swag.Register(SwaggerInfo.InstanceName(), SwaggerInfo)
}
