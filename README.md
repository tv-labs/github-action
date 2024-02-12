# Run the tvlabs CLI

This action runs a pre-compiled Go binary named `tvlabs` and comments the
results on the Pull Request.

## Inputs

### `apikey`

**Required** TV Labs API key.

### `github-token`

**Required** GitHub Token for commenting on PRs.

## Example usage

```yaml
uses: tv-labs/github-action@v1
with:
  apikey: 1234567890
  github-token: ${{ secrets.GITHUB_TOKEN }}
```
