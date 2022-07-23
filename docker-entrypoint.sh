for volume in $BITCART_VOLUMES; do
  if [ -d "$volume" ]; then
    find "$volume" \! -user node -exec chown node '{}' +
  fi
done

exec gosu node "$@"
