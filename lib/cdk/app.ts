import { App } from 'aws-cdk-lib'
import path from 'path'
import * as dotenv from 'dotenv'

import { NextStandaloneStack } from './stack'

dotenv.config()

const app = new App()

if (!process.env.STACK_NAME) {
	throw new Error('Name of CDK stack was not specified!')
}

const commandCwd = process.cwd()

// This is configured in rollup as exported file is in dist folder.
const cdkFolder = __dirname

// CF Certificate if exists
const domains: string = process.env.CF_DOMAINS as unknown as string
const domainNames: string[] = domains ? JSON.parse(domains) : []
const acmCertificateArn: string = process.env.CF_CERTIFICATE_ARN as unknown as string
const cloudfrontDescription: string = process.env.CF_DESCRIPTION || 'Cloudfront for NextJS app'

new NextStandaloneStack(app, process.env.STACK_NAME, {
	apigwServerPath: '/_server',
	apigwImagePath: '/_image',
	assetsZipPath: path.resolve(commandCwd, './next.out/assetsLayer.zip'),
	codeZipPath: path.resolve(commandCwd, './next.out/code.zip'),
	dependenciesZipPath: path.resolve(commandCwd, './next.out/dependenciesLayer.zip'),
	imageHandlerZipPath: path.resolve(cdkFolder, '../dist/image-handler.zip'),
	customServerHandler: 'handler.handler',
	customImageHandler: 'handler.handler',
	lambdaTimeout: process.env.LAMBDA_TIMEOUT ? Number(process.env.LAMBDA_TIMEOUT) : 30,
	lambdaMemory: process.env.LAMBDA_MEMORY ? Number(process.env.LAMBDA_MEMORY) : 1024,
	hostedZone: process.env.HOSTED_ZONE ?? undefined,
	dnsPrefix: process.env.DNS_PREFIX ?? undefined,
	cloudfrontDescription,
	acmCertificateArn,
	domainNames,
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: process.env.CDK_DEFAULT_REGION,
	},
})

app.synth()
