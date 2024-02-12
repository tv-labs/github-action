# Run the tvlabs CLI

This action runs a pre-compiled Go binary named `tvlabs` and comments the results on the Pull Request.

## Inputs

### `github-token`

**Required** GitHub Token for commenting on PRs.

## Example usage

```yaml
uses: tv-labs/github-action@v1
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
```
