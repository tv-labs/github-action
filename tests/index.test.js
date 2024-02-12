const core = require('@actions/core')
const github = require('@actions/github')
const exec = require('@actions/exec')
const fs = require('fs')
const main = require('../src/index') // Ensure this path is correct

// Mock the GitHub Actions core and other libraries
jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('@actions/exec')
jest.mock('fs')

// Setup GitHub context (assuming a pull request context)
const prNumber = 123
const repoName = 'test-repo'
const ownerName = 'test-owner'
github.context.payload = {
  pull_request: {
    number: prNumber
  }
}
github.context.repo = {
  owner: ownerName,
  repo: repoName
}

// Mock for GitHub's Octokit
const createCommentMock = jest.fn()
github.getOctokit = jest.fn().mockReturnValue({
  rest: {
    issues: {
      createComment: createCommentMock
    }
  }
})

// Other utilities
const tvlabs_cli = '/usr/bin/tvlabs'
const outputFile = './results.txt'
const testResults = 'Test results content'

describe.skip('GitHub Action', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks()

    // Setup default mocks
    core.getInput.mockImplementation(name => {
      if (name === 'github-token') return 'fake-token'
      return null
    })

    exec.exec.mockImplementation((command, args) => {
      if (command === `${tvlabs_cli} > ${outputFile}`) return Promise.resolve(0)
      return Promise.reject(new Error('Command failed'))
    })

    fs.readFileSync.mockImplementation((path, options) => {
      if (path === outputFile && options.encoding === 'utf8') return testResults
      return null
    })
  })

  it('creates a comment on a pull request with TV Labs results', async () => {
    await main.run()

    // Verify exec was called correctly
    expect(exec.exec).toHaveBeenCalledWith(`${tvlabs_cli} > ${outputFile}`)

    // Verify fs.readFileSync was called to read the results
    expect(fs.readFileSync).toHaveBeenCalledWith(outputFile, {
      encoding: 'utf8'
    })

    // Verify the comment was created with the correct content
    expect(createCommentMock).toHaveBeenCalledWith({
      owner: ownerName,
      repo: repoName,
      issue_number: prNumber,
      body: expect.stringContaining(testResults)
    })
  })

  it('fails if no pull request is found', async () => {
    // Override GitHub context for this test
    github.context.payload = {}

    await main.run()

    // Check if setFailed was called with the correct error message
    expect(core.setFailed).toHaveBeenCalledWith('No pull request found.')
  })

  it('fails with error on action failure', async () => {
    // Make exec.exec fail
    exec.exec.mockImplementation(() => Promise.reject(new Error('Exec error')))

    await main.run()

    // Check if setFailed was called with the correct error message
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Exec error')
    )
  })
})
