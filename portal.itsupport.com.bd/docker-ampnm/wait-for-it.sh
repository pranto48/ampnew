#!/usr/bin/env bash
#   Use this script to test if a given host and port are available

cmdname=$(basename $0)

echoerr() { if [[ "$QUIET" -ne 1 ]]; then echo "$@" 1>&2; fi }

usage()
{
    cat << USAGE >&2
Usage:
    $cmdname host:port [-s] [-t timeout] [-- command args]
    -h HOST | --host=HOST       Host or IP address to connect to
    -p PORT | --port=PORT       Port to connect to
    -s | --strict               Only execute subcommand if the test succeeds
    -q | --quiet                Don't output any status messages
    -t TIMEOUT | --timeout=TIMEOUT
                                Timeout in seconds, zero for infinite
    -- COMMAND ARGS             Execute command with args after the test finishes
USAGE
    exit 1
}

wait_for_connection()
{
    if [[ "$TIMEOUT" -gt 0 ]]; then
        echoerr "$cmdname: waiting $TIMEOUT seconds for $HOST:$PORT"
    else
        echoerr "$cmdname: waiting for $HOST:$PORT without a timeout"
    fi
    
    start_ts=$(date +%s)
    while :
    do
        (echo > /dev/tcp/$HOST/$PORT) >/dev/null 2>&1
        result=$?
        if [[ $result -eq 0 ]]; then
            end_ts=$(date +%s)
            echoerr "$cmdname: $HOST:$PORT is available after $((end_ts - start_ts)) seconds"
            break
        fi
        sleep 1
        current_ts=$(date +%s)
        if [[ "$TIMEOUT" -gt 0 && $((current_ts - start_ts)) -ge "$TIMEOUT" ]]; then
            echoerr "$cmdname: timeout occurred after $((current_ts - start_ts)) seconds waiting for $HOST:$PORT"
            return 1
        fi
    done
    return 0
}

HOST=
PORT=
TIMEOUT=15
STRICT=0
QUIET=0

while [[ $# -gt 0 ]]
do
    case "$1" in
        *:* )
        HOST=$(printf "%s\n" "$1"| cut -d : -f 1)
        PORT=$(printf "%s\n" "$1"| cut -d : -f 2)
        shift 1
        ;;
        -h)
        HOST="$2"
        if [[ "$HOST" == "" ]]; then break; fi
        shift 2
        ;;
        --host=*)
        HOST="${1#*=}"
        shift 1
        ;;
        -p)
        PORT="$2"
        if [[ "$PORT" == "" ]]; then break; fi
        shift 2
        ;;
        --port=*)
        PORT="${1#*=}"
        shift 1
        ;;
        -t)
        TIMEOUT="$2"
        if [[ "$TIMEOUT" == "" ]]; then break; fi
        shift 2
        ;;
        --timeout=*)
        TIMEOUT="${1#*=}"
        shift 1
        ;;
        -s | --strict)
        STRICT=1
        shift 1
        ;;
        -q | --quiet)
        QUIET=1
        shift 1
        ;;
        --)
        shift
        CLI=("$@")
        break
        ;;
        -*)
        echoerr "Unknown argument: $1"
        usage
        ;;
        *)
        HOST="$1"
        shift 1
        ;;
    esac
done

if [[ "$HOST" == "" || "$PORT" == "" ]]; then
    echoerr "Error: you need to provide a host and port to test."
    usage
fi

wait_for_connection_result=$(wait_for_connection)

if [[ $wait_for_connection_result -ne 0 && $STRICT -eq 1 ]]; then
    echoerr "$cmdname: strict mode, refusing to execute command"
    exit $wait_for_connection_result
fi

if [[ "${#CLI[@]}" -gt 0 ]]; then
    exec "${CLI[@]}"
fi